import { FANTOM_CHAIN_ID as chainId } from '../../../constants.js';
import { getEDecimals } from '../../../utils/getEDecimals.js';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

import { addressBook } from 'blockchain-addressbook';
import ichiPools from '../../../data/fantom/equalizerIchiPools.json';
import volatileV2Pools from '../../../data/fantom/equalizerV2LpPools.json';
const {
  fantom: {
    tokens: { EQUAL },
  },
} = addressBook;

const pools = [...volatileV2Pools, ...ichiPools];
const getEqualizerApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'ftmEQUAL',
    oracle: 'tokens',
    decimals: getEDecimals(EQUAL.decimals),
    reward: EQUAL.address,
    boosted: false,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getEqualizerApys error', result.reason);
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
