import BigNumber from 'bignumber.js';
import BaseSwapMasterChef from '../../../abis/base/BaseSwapMasterChef.js';
import BaseSwapNFT from '../../../abis/base/BaseSwapNFT.js';
import { baseSwapClient } from '../../../apollo/client.js';
import { BASE_CHAIN_ID as chainId } from '../../../constants.js';
import pools from '../../../data/base/baseSwapLpPools.json';
import { fetchPrice } from '../../../utils/fetchPrice.js';
import { getBaseSwapTradingFeeApr } from '../../../utils/getTradingFeeApr.js';
import { fetchContract } from '../../rpc/client.js';
import getApyBreakdown, { type ApyBreakdownResult } from '../common/getApyBreakdown.js';

const masterchef = '0x6Fc0f134a1F20976377b259687b1C15a5d422B47';

const getBaseSwapApys = async (): Promise<ApyBreakdownResult> => {
  const pairAddresses = pools.map((pool) => pool.address.toLowerCase());
  const [farmApys, tradingFeeAprs] = await Promise.all([
    getFarmApys(),
    getBaseSwapTradingFeeApr(baseSwapClient, pairAddresses, 0.0017),
  ]);

  return getApyBreakdown(pools, tradingFeeAprs, farmApys, 0.0017);
};

const getFarmApys = async (): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const bsxTokenPrice = await fetchPrice({ oracle: 'tokens', id: 'BSX' });
  const bswapTokenPrice = await fetchPrice({ oracle: 'tokens', id: 'BSWAP' });

  const [{ bsxRewards, bswapRewards }, { balances, xShare }] = await Promise.all([
    getMasterChefData(),
    getPoolsData(),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const oracle = 'lps';
    const id = pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    // 50% of xToken rewards can be redeemed
    const liquidShare = new BigNumber(10000).minus(xShare[i].dividedBy(2)).dividedBy(10000);

    const yearlyBsxRewards = bsxRewards[i].times(liquidShare).times(secondsPerYear);
    const yearlyBswapRewards = bswapRewards[i].times(secondsPerYear);
    const yearlyBsxRewardsInUsd = yearlyBsxRewards.times(bsxTokenPrice).dividedBy('1e18');
    const yearlyBswapRewardsInUsd = yearlyBswapRewards.times(bswapTokenPrice).dividedBy('1e18');

    const yearlyRewardsInUsd = yearlyBsxRewardsInUsd.plus(yearlyBswapRewardsInUsd);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
  }

  return apys;
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, BaseSwapMasterChef, chainId);
  const masterCalls = [];
  pools.forEach((pool) => {
    masterCalls.push(masterchefContract.read.getPoolInfo([pool.rewardPool as `0x${string}`]));
  });

  const masterResults = await Promise.all(masterCalls);

  const bsxRewards: BigNumber[] = masterResults.map((v) => new BigNumber(v[6].toString()));
  const bswapRewards: BigNumber[] = masterResults.map((v) => new BigNumber(v[7].toString()));

  return { bsxRewards, bswapRewards };
};

const getPoolsData = async () => {
  const balanceCalls = [];
  const xShareCalls = [];
  pools.forEach((pool) => {
    const poolContract = fetchContract(pool.rewardPool, BaseSwapNFT, chainId);
    balanceCalls.push(poolContract.read.getPoolInfo());
    xShareCalls.push(poolContract.read.xTokenRewardsShare());
  });

  const [balanceResults, xShareResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(xShareCalls),
  ]);

  const balances: BigNumber[] = balanceResults.map((v) => new BigNumber(v[7].toString()));
  const xShare: BigNumber[] = xShareResults.map((v) => new BigNumber(v.toString()));
  return { balances, xShare };
};

export default getBaseSwapApys;
