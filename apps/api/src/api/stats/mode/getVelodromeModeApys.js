import { MODE_CHAIN_ID as chainId } from '../../../constants.js';
import { getEDecimals } from '../../../utils/getEDecimals.js';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

import { addressBook } from 'blockchain-addressbook';
import volatilePools from '../../../data/mode/velodromeModePools.json';
import stablePools from '../../../data/mode/velodromeModeStablePools.json';

const {
  mode: {
    tokens: { MODE },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getVelodromeModeApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'MODE',
    oracle: 'tokens',
    decimals: getEDecimals(MODE.decimals),
    reward: MODE.address,
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

export default getVelodromeModeApys;
