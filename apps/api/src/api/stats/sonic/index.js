import pendlePools from '../../../data/sonic/pendlePools.json';
import { getEquilibriaApys } from '../common/getEquilibriaApys.js';
import { getAaveV3Apys } from './getAaveV3Apys.js';
import { getBeSonicApy } from './getBeSonicApy.js';
import { getBeefyCowSonicApys } from './getBeefyCowSonicApys.js';
import getBeetsSonicApys from './getBeetsSonicApys.js';
import { getCurveApys } from './getCurveApys.js';
import getDefiveApys from './getDefiveApys.js';
//import { getBeefyCowSonicApys } from './getBeefyCowSonicApys';
import getEqualizerApys from './getEqualizerApys.js';
import { getEulerSonicApys } from './getEulerSonicApys.js';
import { getPenpieApys } from './getPenpieApys.js';
import getShadowApys from './getShadowApys.js';
import { getSonicSiloApys } from './getSonicSiloApys.js';
import { getSwapxApys } from './getSwapxApys.js';

const getApys = [
  getAaveV3Apys,
  getBeefyCowSonicApys,
  getEqualizerApys,
  getBeetsSonicApys,
  getSwapxApys,
  getPenpieApys,
  () => getEquilibriaApys(pendlePools),
  getCurveApys,
  getSonicSiloApys,
  getShadowApys,
  getBeSonicApy,
  getDefiveApys,
  getEulerSonicApys,
];

const getSonicApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  const promises = [];
  getApys.forEach((getApy) => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getSonicApys error', result.reason);
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
  console.log(`> [APY] Sonic finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

export { getSonicApys };
