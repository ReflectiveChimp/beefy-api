import { serviceEventBus } from '../../utils/ServiceEventBus.jsx';
import { getKey, setKey } from '../../utils/cache/index.js';
import { getArbitrumApys } from './arbitrum/index.js';
import { getAvaxApys } from './avax/index.js';
import { getBaseApys } from './base/index.js';
import { getBerachainApys } from './berachain/index.js';
import { getBSCApys } from './bsc/index.js';
import { getCronosApys } from './cronos/index.js';
import { getEthereumApys } from './ethereum/index.js';
import { getFraxtalApys } from './fraxtal/index.js';
import { BOOST_APR_EXPIRED, fetchBoostAprs } from './getBoostAprs.js';
import { getGnosisApys } from './gnosis/index.js';
import { getLineaApys } from './linea/index.js';
import { getLiskApys } from './lisk/index.js';
import { getMantleApys } from './mantle/index.js';
import { getMaticApys } from './matic/index.js';
import { getMetisApys } from './metis/index.js';
import { getModeApys } from './mode/index.js';
import { getMoonbeamApys } from './moonbeam/index.js';
import { getOptimismApys } from './optimism/index.js';
import { getRootstockApys } from './rootstock/index.js';
import { getSagaApys } from './saga/index.js';
import { getScrollApys } from './scroll/index.js';
import { getSeiApys } from './sei/index.js';
import { getSonicApys } from './sonic/index.js';
import { getZksyncApys } from './zksync/index.js';

const INIT_DELAY = process.env.INIT_DELAY || 30 * 1000;
const BOOST_APR_INIT_DELAY = 5 * 1000;
var REFRESH_INTERVAL = 15 * 60 * 1000;
const BOOST_REFRESH_INTERVAL = 2 * 60 * 1000;

let apys = {};
let apyBreakdowns = {};
let boostAprs = {};

const getApys = () => {
  return {
    apys,
    apyBreakdowns,
  };
};

const getBoostAprs = () => boostAprs;

const updateApys = async () => {
  console.log('> updating apys');
  const start = Date.now();
  try {
    const results = await Promise.allSettled([
      getMaticApys(),
      getAvaxApys(),
      getBSCApys(),
      getArbitrumApys(),
      getCronosApys(),
      getMetisApys(),
      getMoonbeamApys(),
      getOptimismApys(),
      // getKavaApys(),
      getEthereumApys(),
      // getCantoApys(),
      getZksyncApys(),
      getBaseApys(),
      getGnosisApys(),
      getLineaApys(),
      getMantleApys(),
      getFraxtalApys(),
      getModeApys(),
      // getMantaApys(),
      getSeiApys(),
      getRootstockApys(),
      getScrollApys(),
      getLiskApys(),
      getSonicApys(),
      getBerachainApys(),
      getSagaApys(),
    ]);

    for (const result of results) {
      if (result.status !== 'fulfilled') {
        console.warn('getApys error', result.reason);
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

    console.log(`> updated apys (${(Date.now() - start) / 1000}s)`);
    await saveToRedis();
  } catch (err) {
    console.error('> apy initialization failed', err);
  }

  setTimeout(updateApys, REFRESH_INTERVAL);
};

const updateBoostAprs = async () => {
  console.log('> updating boost aprs');
  const start = Date.now();
  try {
    const updatedBoostAprs = await fetchBoostAprs();
    boostAprs = {
      ...boostAprs,
      ...updatedBoostAprs,
    };
    //-1 will be returned when boost has ended and it will be removed from the api response
    Object.keys(boostAprs)
      .filter((boostId) => boostAprs[boostId] === BOOST_APR_EXPIRED)
      .forEach((boostId) => {
        delete boostAprs[boostId];
      });
    await saveBoostsToRedis();
    console.log(`> updated boost aprs (${(Date.now() - start) / 1000}s)`);
  } catch (err) {
    console.error(`> error updating boost aprs: ${err.message}`);
  }

  setTimeout(updateBoostAprs, BOOST_REFRESH_INTERVAL);
};

const initApyService = async () => {
  const cachedApy = await getKey('APY');
  const cachedApyBreakdown = await getKey('APY_BREAKDOWN');
  const cachedBoostAprs = await getKey('BOOST_APRS');
  apys = cachedApy ?? {};
  apyBreakdowns = cachedApyBreakdown ?? {};
  boostAprs = cachedBoostAprs ?? {};

  setTimeout(updateApys, INIT_DELAY);
  await serviceEventBus.waitForFirstEvent('vaults/updated');
  setTimeout(updateBoostAprs, BOOST_APR_INIT_DELAY);
};

const saveToRedis = async () => {
  await setKey('APY', apys);
  await setKey('APY_BREAKDOWN', apyBreakdowns);
};

const saveBoostsToRedis = async () => {
  await setKey('BOOST_APRS', boostAprs);
};

export { getApys, getBoostAprs, initApyService };
