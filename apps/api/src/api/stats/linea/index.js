import { getBeefyCowLineaApys } from './getBeefyCowLineaApys.js';
import { getLynexApys } from './getLynexApys.js';
import getMendiApys from './getMendiApys.js';
import { getNileApys } from './getNileApys.js';
import getStargateLineaApys from './getStargateLineaApys.js';

const getApys = [getStargateLineaApys, getMendiApys, getLynexApys, getNileApys, getBeefyCowLineaApys];

const getLineaApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  const promises = [];
  getApys.forEach((getApy) => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getLineaApys error', result.reason);
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
  console.log(`> [APY] Linea finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

export { getLineaApys };
