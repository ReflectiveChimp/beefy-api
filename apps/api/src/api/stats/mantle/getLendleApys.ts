import BigNumber from 'bignumber.js';
import jp from 'jsonpath';
import LendleChefAbi from '../../../abis/mantle/LendleChef.js';
import IAaveProtocolDataProviderAbi from '../../../abis/matic/AaveProtocolDataProvider.js';
import { MANTLE_CHAIN_ID } from '../../../constants.js';
import { fetchPrice } from '../../../utils/fetchPrice.js';
import { fetchContract } from '../../rpc/client.js';
import getApyBreakdown, { type ApyBreakdownResult } from '../common/getApyBreakdown.js';

const aaveProtocolDataProvider = '0x552b9e4bae485C4B7F540777d7D25614CdB84773';
const lendleChef = '0x79e2fd1c484EB9EE45001A98Ce31F28918F27C41';
import pools from '../../../data/mantle/lendlePools.json';
import { BIG_ZERO } from '../../../utils/big-number.js';
import { getAddress } from 'viem';
import { toNumber } from '../../../utils/number.js';
const rewardId = 'LEND';
const rewardDecimals = '1e18';
const secondsPerYear = 31536000;
const RAY_DECIMALS = '1e27';
const burn = 0.5;

const getLendleApys = async (): Promise<ApyBreakdownResult> => {
  const farmAprs: BigNumber[] = [];

  const [{ supplyAprs, suppliesInUsd }, rewardInUsdPerSecond, liquidStakingAprs] = await Promise.all([
    getPoolData(),
    getIncentiveControllerData(),
    getLiquidStakingData(),
  ]);

  for (let i = 0; i < pools.length; ++i) {
    const rewardUsd = rewardInUsdPerSecond[i];
    const supplyUsd = suppliesInUsd[i];
    if (!rewardUsd || !supplyUsd) {
      farmAprs.push(BIG_ZERO);
      continue;
    }

    const farmApr = rewardUsd.dividedBy(supplyUsd).times(secondsPerYear);
    farmAprs.push(farmApr);
  }

  return getApyBreakdown(pools, supplyAprs, farmAprs, 0, liquidStakingAprs);
};

const getPoolData = async () => {
  const supplyAprs: Record<string, BigNumber> = {};
  const suppliesInUsd: BigNumber[] = [];

  const dataProvider = fetchContract(aaveProtocolDataProvider, IAaveProtocolDataProviderAbi, MANTLE_CHAIN_ID);
  await Promise.all(pools.map(async (pool, i) => {
    const poolData = await dataProvider.read.getReserveData([getAddress(pool.address)]);
    const tokenPrice = await fetchPrice({
      oracle: 'tokens',
      id: pool.oracleId,
    });

    supplyAprs[pool.address.toLowerCase()] = new BigNumber(poolData[3].toString()).dividedBy(RAY_DECIMALS);

    suppliesInUsd[i] = new BigNumber(poolData[0].toString())
        .plus(new BigNumber(poolData[1].toString()))
        .plus(new BigNumber(poolData[2].toString()))
        .dividedBy(pool.decimals)
        .times(tokenPrice);
  }));

  return { supplyAprs, suppliesInUsd };
};

const getIncentiveControllerData = async (): Promise<BigNumber[]> => {
  const rewardInUsdPerSecond: BigNumber[] = [];
  const incentivesControllerContract = fetchContract(lendleChef, LendleChefAbi, MANTLE_CHAIN_ID);
  const poolInfoCalls = (pools as any[]).map((pool) => {
    return incentivesControllerContract.read.poolInfo([pool.aToken]);
  });
  const [poolInfo, rewardsPerSecond, totalAllocPoint] = await Promise.all([
    Promise.all(poolInfoCalls),
    incentivesControllerContract.read.rewardsPerSecond().then((res) => new BigNumber(res.toString())),
    incentivesControllerContract.read.totalAllocPoint().then((res) => new BigNumber(res.toString())),
  ]);
  const allocPoints = poolInfo.map((res) => new BigNumber(res[1].toString()));
  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewardId });

  allocPoints.forEach((allocPoint) => {
    rewardInUsdPerSecond.push(
      allocPoint
        .times(rewardsPerSecond)
        .dividedBy(totalAllocPoint)
        .dividedBy(rewardDecimals)
        .times(rewardPrice)
        .times(burn),
    );
  });

  return rewardInUsdPerSecond;
};

const getLiquidStakingData = async () => {
  const liquidStakingAprs: number[] = Array.from({length: pools.length}, () => 0);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i]!;
    if (pool.lsUrl) {
      let lsAprFactor = 1;
      if (pool.lsAprFactor) lsAprFactor = pool.lsAprFactor;

      try {
        const url = pool.lsUrl!;
        const lsResponse: any = await fetch(url).then((res) => res.json());
        const lsApr = toNumber(jp.query(lsResponse, pool.dataPath)[0], 0);

        liquidStakingAprs[i] = (lsApr * lsAprFactor) / 100;
      } catch {
        console.error(`Failed to fetch ${pool.name} liquid staking APR from ${pool.lsUrl}`);
      }
    }
  }
  return liquidStakingAprs;
};

export default getLendleApys;
