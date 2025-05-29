import equilibriaPools from '../../../data/arbitrum/equilibriaPools.json';
import pendlePools from '../../../data/arbitrum/pendlePools.json';
import { getEquilibriaApys } from '../common/getEquilibriaApys.js';
import { getAaveV3Apys } from './getAaveV3Apys.js';
import { getArbCompoundV3Apys } from './getArbCompoundV3Apys.js';
import getAuraArbitrumApys from './getAuraArbitrumApys.js';
import getBalancerArbApys from './getBalancerArbApys.js';
import { getBeefyArbCowApys } from './getBeefyArbCowApys.js';
import { getConvexApys } from './getConvexApys.js';
import { getCurveApys } from './getCurveApys.js';
import { getGmxApys } from './getGmxApys.js';
import { getGnsApys } from './getGnsApys.js';
import { getHopApys } from './getHopApys.js';
import { getMimApys } from './getMimApys.js';
import { getPenpieApys } from './getPenpieApys.js';
import getRamsesApys from './getRamsesApys.js';
import getVenusApys from './getVenusApys.js';

const getApys = [
  // getArbSiloApys,
  getAuraArbitrumApys,
  getGnsApys,
  getHopApys,
  () => getEquilibriaApys([...pendlePools, ...equilibriaPools]),
  getPenpieApys,
  getMimApys,
  // getGmxV2Apys,
  getGmxApys,
  getCurveApys,
  getConvexApys,
  getBalancerArbApys,
  getRamsesApys,
  getArbCompoundV3Apys,
  getBeefyArbCowApys,
  getAaveV3Apys,
  getVenusApys,
];

const getArbitrumApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  const promises = [];
  getApys.forEach((getApy) => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getArbitrumApys error', result.reason);
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
  console.log(`> [APY] Arbitrum finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

export { getArbitrumApys };
