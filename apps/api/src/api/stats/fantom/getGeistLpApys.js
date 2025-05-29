import BigNumber from 'bignumber.js';
import GeistChef from '../../../abis/fantom/GeistChef.jsx';
import { spookyClient } from '../../../apollo/client.js';
import { FANTOM_CHAIN_ID, SPOOKY_LPF } from '../../../constants.js';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr.js';
import { fetchContract } from '../../rpc/client.js';
import getApyBreakdown from '../common/getApyBreakdown.js';

import pools from '../../../data/fantom/geistLpPools.json';
import { fetchPrice } from '../../../utils/fetchPrice.js';
import { getTotalLpStakedInUsd } from '../../../utils/getTotalStakedInUsd.js';

const chef = '0xE40b7FA6F5F7FB0Dc7d56f433814227AAaE020B5';
const oracle = 'tokens';
const oracleId = 'GEIST';
const DECIMALS = '1e18';

const getGeistLpApys = async () => {
  const pairAddresses = pools.map((pool) => pool.address);
  const tradingAprs = await getTradingFeeApr(spookyClient, pairAddresses, SPOOKY_LPF);

  const farmApys = [];
  const promises = [];
  pools.forEach((pool) => promises.push(getPoolApy(chef, pool)));
  const values = await Promise.all(promises);
  for (const item of values) {
    farmApys.push(item);
  }

  return getApyBreakdown(pools, tradingAprs, farmApys, SPOOKY_LPF);
};

const getPoolApy = async (masterchef, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalLpStakedInUsd(masterchef, pool, pool.chainId),
  ]);
  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const masterchefContract = fetchContract(masterchef, GeistChef, FANTOM_CHAIN_ID);

  const [rewardsPerSec, allocPoint, totalAllocPoint] = await Promise.all([
    masterchefContract.read.rewardsPerSecond().then((res) => new BigNumber(res.toString())),
    masterchefContract.read.poolInfo([pool.address]).then((res) => new BigNumber(res[0].toString())),
    masterchefContract.read.totalAllocPoint().then((res) => new BigNumber(res.toString())),
  ]);

  const secondsPerYear = 31536000;
  const yearlyRewards = rewardsPerSec
    .times(allocPoint)
    .times(secondsPerYear)
    .dividedBy(totalAllocPoint)
    .dividedBy(2); // 50% penalty

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

export default getGeistLpApys;
