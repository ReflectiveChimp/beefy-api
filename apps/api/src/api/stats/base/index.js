import { BASE_CHAIN_ID } from '../../../constants.js';
import mellowAeroPools from '../../../data/base/mellowAeroPools.json';
import morphoPools from '../../../data/base/morphoPools.json';
import pendlePools from '../../../data/base/pendlePools.json';
import { getEquilibriaApys } from '../common/getEquilibriaApys.js';
import { getMellowVeloApys } from '../common/getMellowVeloApys.js';
import { getMorphoApys } from '../common/morpho/getMorphoApys.js';
import { getAerodromeApys } from './getAerodromeApys.js';
import getAlienBaseApys from './getAlienBaseApys.js';
import getAuraBaseApys from './getAuraBaseApys.js';
import getBalancerBaseApys from './getBalancerApys.js';
import { getBaseCompoundV3Apys } from './getBaseCompoundV3Apys.js';
import getBaseSwapApys from './getBaseSwapApys.js';
import { getBeefyBaseCowApys } from './getBeefyBaseCowApys.js';
import { getBesnARSApy } from './getBesnARSApy.js';
import { getCurveApys } from './getCurveApys.js';
import { getPenpieApys } from './getPenpieApys.js';
import { getTokemakApys } from './getTokemakApys.js';
import { getTrueApys } from './getTrueApys.js';

const getApys = [
  getTrueApys,
  getTokemakApys,
  getBesnARSApy,
  getAerodromeApys,
  getCurveApys,
  getBalancerBaseApys,
  getBaseSwapApys,
  getAlienBaseApys,
  getBaseCompoundV3Apys,
  getAuraBaseApys,
  () => getMellowVeloApys(BASE_CHAIN_ID, mellowAeroPools),
  () => getMorphoApys(BASE_CHAIN_ID, morphoPools),
  () => getEquilibriaApys(pendlePools),
  getPenpieApys,
  getBeefyBaseCowApys,
];

const getBaseApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  const promises = [];
  getApys.forEach((getApy) => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getBaseApys error', result.reason);
      continue;
    }

    // Set default APY values
    let mappedApyValues = result.value;
    let mappedApyBreakdownValues = {};

    // Loop through key values and move default breakdown format
    // To require totalApy key
    for (const [key, value] of Object.entries(result.value)) {
      mappedApyBreakdownValues[key] = {
        totalApy: value,
      };
    }

    // Break out to apy and breakdowns if possible
    const hasApyBreakdowns = 'apyBreakdowns' in result.value;
    if (hasApyBreakdowns) {
      mappedApyValues = result.value.apys;
      mappedApyBreakdownValues = result.value.apyBreakdowns;
    }

    apys = { ...apys, ...mappedApyValues };

    apyBreakdowns = { ...apyBreakdowns, ...mappedApyBreakdownValues };
  }

  const end = Date.now();
  console.log(`> [APY] Base finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

export { getBaseApys };
