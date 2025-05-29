import { SONIC_CHAIN_ID as chainId } from '../../../constants.js';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

import volatilePools from '../../../data/sonic/equalizerLpPools.json';
import stablePools from '../../../data/sonic/equalizerStableLpPools.json';

const pools = [...stablePools, ...volatilePools];
const getEqualizerApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'EQUAL',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0xddF26B42C1d903De8962d3F79a74a501420d5F19',
    boosted: false,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getEqualizerSonicApys error', result.reason);
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

export default getEqualizerApys;
