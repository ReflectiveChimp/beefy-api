import { LISK_CHAIN_ID as chainId } from '../../../constants.js';
import { getEDecimals } from '../../../utils/getEDecimals.js';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

import { addressBook } from 'blockchain-addressbook';
import volatilePools from '../../../data/lisk/velodromeLiskPools.json';
import stablePools from '../../../data/lisk/velodromeLiskStablePools.json';

const {
  lisk: {
    tokens: { XVELO },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getVelodromeLiskApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'XVELO',
    oracle: 'tokens',
    decimals: getEDecimals(XVELO.decimals),
    reward: XVELO.address,
    boosted: false,
    singleReward: true,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getVelodromeApys error', result.reason);
    } else {
      apys = { ...apys, ...result.value.apys };
      apyBreakdowns = { ...apyBreakdowns, ...result.value.apyBreakdowns };
    }
  }

  return {
    apys,
    apyBreakdowns,
  };
};

export default getVelodromeLiskApys;
