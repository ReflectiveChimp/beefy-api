import { OPTIMISM_CHAIN_ID } from '../../../constants.js';
import mellowVeloPools from '../../../data/optimism/mellowVeloPools.json';
import { getMellowVeloApys } from '../common/getMellowVeloApys.js';
import { getAaveV3Apys } from './getAaveV3Apys.js';
import getAuraApys from './getAuraOptimismApys.js';
import getBalancerOpApys from './getBalancerOpApys.js';
import getBeOpxApy from './getBeOpxApy.js';
import getBeOpxEarnApy from './getBeOpxEarnApy.js';
import getBeVeloV2Apr from './getBeVeloV2Apr.js';
import { getBeefyOPCowApys } from './getBeefyOPCowApys.js';
import getBeetsOpApys from './getBeetsOpApys.js';
import { getCurveApys } from './getCurveApys.js';
import { getHopApys } from './getHopApys.js';
import { getHopOpApys } from './getHopOpApys.js';
import getMmyApys from './getMmyApys.js';
import { getOlpApys } from './getOlpApys.js';
import { getOpCompoundV3Apys } from './getOpCompoundV3Apys.js';
import { getSonneApys } from './getSonneApys.js';
import getStargateOpApys from './getStargateOpApys.js';
import getVelodromeApys from './getVelodromeApys.js';
import getbeVeloApy from './getbeVeloApy.js';

const getApys = [
  getSonneApys,
  getAuraApys,
  getBalancerOpApys,
  getMmyApys,
  getBeetsOpApys,
  getCurveApys,
  getVelodromeApys,
  getStargateOpApys,
  getbeVeloApy,
  getAaveV3Apys,
  getHopApys,
  getHopOpApys,
  getOlpApys,
  getBeOpxApy,
  getBeOpxEarnApy,
  getBeVeloV2Apr,
  getBeefyOPCowApys,
  () => getMellowVeloApys(OPTIMISM_CHAIN_ID, mellowVeloPools),
  getOpCompoundV3Apys,
];

const getOptimismApys = async () => {
  const start = Date.now();
  let apys = {};
  let apyBreakdowns = {};

  const promises = [];
  getApys.forEach((getApy) => promises.push(getApy()));
  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getOptimismApys error', result.reason);
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
  console.log(`> [APY] Optimism finished updating in ${(end - start) / 1000}s`);

  return {
    apys,
    apyBreakdowns,
  };
};

export { getOptimismApys };
