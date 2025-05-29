import BigNumber from 'bignumber.js';
import { fantom } from 'blockchain-addressbook/fantom';
import ERC20Abi from '../../../abis/ERC20Abi.jsx';
import IBalancerVault from '../../../abis/IBalancerVault.jsx';
import BeethovenRewarder from '../../../abis/fantom/BeethovenRewarder.jsx';
import BeethovenxChef from '../../../abis/fantom/BeethovenxChef.jsx';
import { beetClient } from '../../../apollo/client.js';
import { FANTOM_CHAIN_ID } from '../../../constants.js';
import pools from '../../../data/fantom/beethovenxDualPools.json';
import { fetchPrice } from '../../../utils/fetchPrice.js';
import getBlockTime from '../../../utils/getBlockTime.js';
import { getTradingFeeAprBalancerFTM } from '../../../utils/getTradingFeeApr.js';
import { fetchContract } from '../../rpc/client.js';
import getApyBreakdown from '../common/getApyBreakdown.js';

const masterchef = '0x8166994d9ebBe5829EC86Bd81258149B87faCfd3';
const oracleIdA = 'BEETS';
const oracleA = 'tokens';
const DECIMALSA = '1e18';
const secondsPerYear = 31536000;
const liquidityProviderFee = 0.0075;
const burn = 0.128;

const getBeethovenxDualApys = async () => {
  const pairAddresses = pools.map((pool) => pool.address);

  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeAprBalancerFTM(beetClient, pairAddresses, liquidityProviderFee),
    getFarmApys(pools),
  ]);
  return getApyBreakdown(pools, tradingAprs, farmApys[0], liquidityProviderFee, farmApys[1]);
};

const getFarmApys = async (pools) => {
  const apys = [];
  const lsAprs = [];

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const [
    secondsPerBlock,
    { blockRewards, totalAllocPoint },
    { balances, allocPoints, rewarders, tokenBRewardRates },
  ] = await Promise.all([getBlockTime(FANTOM_CHAIN_ID), getMasterChefData(), getPoolsData(pools)]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const stakedPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(DECIMALSA);

    const poolBlockRewards = blockRewards.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewards
      .times(tokenPriceA)
      .times(1 - burn)
      .dividedBy(DECIMALSA);
    const yearlyRewardsBInUsd = await (async () => {
      if (rewarders[i] === '0x0000000000000000000000000000000000000000') {
        return 0;
      } else {
        const tokenPriceB = await fetchPrice({
          oracle: pool.oracleB,
          id: pool.oracleIdB,
        });
        const yearlyRewardsB = tokenBRewardRates[i].times(secondsPerYear);
        return yearlyRewardsB.times(tokenPriceB).dividedBy(pool.decimalsB);
      }
    })();

    const yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);
    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);

    let aprFixed = 0;
    if (pool.liquidstaking) {
      aprFixed = await getLiquidStakingPoolYield(pool);
    }
    lsAprs.push(aprFixed);
  }

  return [apys, lsAprs];
};

const getLiquidStakingPoolYield = async (pool) => {
  const balVault = fetchContract(fantom.platforms.beethovenx.router, IBalancerVault, FANTOM_CHAIN_ID);
  const tokenQtys = await balVault.read.getPoolTokens([pool.vaultPoolId]);

  const qty = [];
  let totalQty = new BigNumber(0);
  for (let j = 0; j < tokenQtys[1].length; j++) {
    if (pool.composable) {
      if (j != pool.bptIndex) {
        const price = await fetchPrice({
          oracle: 'tokens',
          id: pool.tokens[j].oracleId,
        });
        const amt = new BigNumber(tokenQtys[1][j].toString())
          .times(price)
          .dividedBy([pool.tokens[j].decimals]);
        totalQty = totalQty.plus(amt);
        qty.push(amt);
      }
    } else {
      const price = await fetchPrice({
        oracle: 'tokens',
        id: pool.tokens[j].oracleId,
      });
      const amt = new BigNumber(tokenQtys[1][j].toString()).times(price).dividedBy([pool.tokens[j].decimals]);
      totalQty = totalQty.plus(amt);
      qty.push(amt);
    }
  }

  let apr = 0;
  try {
    const response = pool.ankrUrl
      ? await fetch(pool.ankrUrl).then((res) => res.json())
      : await fetch(pool.staderUrl).then((res) => res.json());

    const lsApr = pool.ankrUrl ? response.apy * 1 : response.value;

    apr = (lsApr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100;
    apr = pool.balancerChargesFee ? apr * 0.75 : apr;
  } catch (err) {
    console.error(`Error fetching ls yield for ${pool.name}`);
  }

  // console.log(pool.name, lsApr, apr);
  return apr;
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, BeethovenxChef, FANTOM_CHAIN_ID);
  const [blockRewards, totalAllocPoint] = await Promise.all([
    masterchefContract.read.beetsPerBlock().then((res) => new BigNumber(res.toString())),
    masterchefContract.read.totalAllocPoint().then((res) => new BigNumber(res.toString())),
  ]);
  return { blockRewards, totalAllocPoint };
};

const getPoolsData = async (pools) => {
  const masterchefContract = fetchContract(masterchef, BeethovenxChef, FANTOM_CHAIN_ID);
  const balanceCalls = [];
  const allocPointCalls = [];
  const rewarderCalls = [];
  const tokenBPerSecCalls = [];
  pools.forEach((pool) => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, FANTOM_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([pool.strat ?? masterchef]));
    allocPointCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
    rewarderCalls.push(masterchefContract.read.rewarder([pool.poolId]));
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(allocPointCalls),
    Promise.all(rewarderCalls),
  ]);

  const balances = res[0].map((v) => new BigNumber(v.toString()));
  const allocPoints = res[1].map((v) => new BigNumber(v[0].toString()));
  const rewarders = res[2].map((v) => v);

  pools.forEach((_, i) => {
    if (rewarders[i] !== '0x0000000000000000000000000000000000000000') {
      const rewarderContract = fetchContract(rewarders[i], BeethovenRewarder, FANTOM_CHAIN_ID);
      tokenBPerSecCalls.push(rewarderContract.read.rewardPerSecond());
    } else {
      tokenBPerSecCalls.push(Number.NaN);
    }
  });

  const tokenRewardsMulticalls = await Promise.all(tokenBPerSecCalls);
  const tokenBRewardRates = tokenRewardsMulticalls.map((v) => new BigNumber(v.toString()));

  return { balances, allocPoints, rewarders, tokenBRewardRates };
};

export default getBeethovenxDualApys;
