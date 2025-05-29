import { SONIC_CHAIN_ID as chainId } from '../../../constants.js';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';

//import stablePools from '../../../data/sonic/shadowStableLpPools.json';
import volatilePools from '../../../data/sonic/shadowLpPools.json';

const pools = [/*...stablePools, */ ...volatilePools];
const getShadowApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'xSHADOW',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0x5050bc082FF4A74Fb6B0B04385dEfdDB114b2424',
    ramses: true,
    rewardScale: '1e18',
    //log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getShadowSonicApys error', result.reason);
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

export default getShadowApys;
