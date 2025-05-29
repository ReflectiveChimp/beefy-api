import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants.js';
import { getEDecimals } from '../../../utils/getEDecimals.js';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

import { addressBook } from 'blockchain-addressbook';
import oldVolatilePools from '../../../data/optimism/oldVelodromeLpPools.json';
import oldStablePools from '../../../data/optimism/oldVelodromeStableLpPools.json';
import volatilePools from '../../../data/optimism/velodromeLpPools.json';
import stablePools from '../../../data/optimism/velodromeStableLpPools.json';

const {
  optimism: {
    tokens: { VELO, VELOV2 },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const oldPools = [...oldStablePools, ...oldVolatilePools];
const getVelodromeApys = async () => {
  const oldGaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: oldPools,
    oracleId: 'VELO',
    oracle: 'tokens',
    decimals: getEDecimals(VELO.decimals),
    reward: VELO.address,
    boosted: false,
    // log: true,
  });

  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'VELOV2',
    oracle: 'tokens',
    decimals: getEDecimals(VELOV2.decimals),
    reward: VELOV2.address,
    boosted: false,
    singleReward: true,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([oldGaugeApys, gaugeApys]);
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

export default getVelodromeApys;
