import getBalancerApys from './getBalancerAvaxApys.js';
import { getBeefyAvaxCowApys } from './getBeefyAvaxCowApys.js';
import { getEulerAvaxApys } from './getEulerAvaxApys.js';
import { getGmxApys } from './getGmxApys.js';
import getJoeApy from './getJoeApy.js';
import getStargateApys from './getStargateAvaxApys.js';

const getApys = [
  // getAaveV3Apys,
  // getAuraAvaxApys,
  getBalancerApys,
  getGmxApys,
  getJoeApy,
  getStargateApys,
  getBeefyAvaxCowApys,
  getEulerAvaxApys,
];

const getAvaxApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  const promises = [];
  getApys.forEach((getApy) => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getAvaxApys error', result.reason);
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
  console.log(`> [APY] Avalanche finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

export { getAvaxApys };
