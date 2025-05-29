import { ETH_CHAIN_ID } from '../../../constants.js';
import morphoPools from '../../../data/ethereum/morphoPools.json';
import pendlePools from '../../../data/ethereum/pendlePools.json';
import { getEquilibriaApys } from '../common/getEquilibriaApys.js';
import { getMorphoApys } from '../common/morpho/getMorphoApys.js';
import { getAuraApys } from './getAuraApys.js';
import getAuraBalApy from './getAuraBalApy.js';
import { getBifiMaxiApy } from './getBifiMaxiApy.js';
import { getConvexApys } from './getConvexApys.js';
import { getConvexCrvApy } from './getConvexCrvApy.js';
import { getConvexCvxApy } from './getConvexCvxApy.js';
import { getConvexCvxTokensApy } from './getConvexCvxTokensApy.js';
import { getCurveApys } from './getCurveApys.js';
import { getETHCompoundV3Apys } from './getEthCompoundApys.js';
import { getEthSiloApys } from './getEthereumSiloApys.js';
import { getFxApys } from './getFxApys.js';
import { getPenpieApys } from './getPenpieApys.js';
import { getSkyApy } from './getSkyApy.js';
import { getTokemakApys } from './getTokemakApys.js';
import { getUsualCurveApys } from './getUsualCurveApys.js';
import { getbeQIApy } from './getbeQIApy.js';

const getApys = [
  getAuraApys,
  getbeQIApy,
  getCurveApys,
  getConvexApys,
  getConvexCrvApy,
  getConvexCvxApy,
  getConvexCvxTokensApy,
  getFxApys,
  getBifiMaxiApy,
  getAuraBalApy,
  getPenpieApys,
  () => getEquilibriaApys(pendlePools),
  () => getMorphoApys(ETH_CHAIN_ID, morphoPools),
  getETHCompoundV3Apys,
  getEthSiloApys,
  getSkyApy,
  getUsualCurveApys,
  getTokemakApys,
];

const getEthereumApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  const promises = [];
  getApys.forEach((getApy) => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getEthereumApys error', result.reason);
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
  console.log(`> [APY] Ethereum finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

export { getEthereumApys };
