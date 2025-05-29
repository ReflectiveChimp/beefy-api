import {
  ARBITRUM_CHAIN_ID as ARB_CHAIN_ID,
  AVAX_CHAIN_ID,
  BASE_CHAIN_ID,
  BSC_CHAIN_ID,
  ETH_CHAIN_ID,
  FRAXTAL_CHAIN_ID as FRX_CHAIN_ID,
  GNOSIS_CHAIN_ID as GNO_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
  POLYGON_CHAIN_ID,
  SONIC_CHAIN_ID,
} from '../../constants.js';
import arbitrumequilibriaPools from '../../data/arbitrum/equilibriaPools.json';
import arbitrumPendlePools from '../../data/arbitrum/pendlePools.json';
import avaxEulerPools from '../../data/avax/eulerPools.json';
import baseAlienBaseBunniPools from '../../data/base/alienBaseBunniPools.json';
import baseMellowAeroPools from '../../data/base/mellowAeroPools.json';
import baseMorphoPools from '../../data/base/morphoPools.json';
import basePendlePools from '../../data/base/pendlePools.json';
import baseTruePools from '../../data/base/truePools.json';
import bscPendlePools from '../../data/bsc/pendlePools.json';
import ethCurveLendPools from '../../data/ethereum/curveLendPools.json';
import ethMorphoPools from '../../data/ethereum/morphoPools.json';
import ethereumPendlePools from '../../data/ethereum/pendlePools.json';
import fraxtalCurveLendPools from '../../data/fraxtal/curveLendPools.json';
import fraxtalCurvePools from '../../data/fraxtal/curvePools.json';
import fraxtalVeloStablePools from '../../data/fraxtal/veloStablePools.json';
import gnosisCurvePools from '../../data/gnosis/curvePools.json';
import polygonMorphoPools from '../../data/matic/morphoPools.json';
import optimismMellowVeloPools from '../../data/optimism/mellowVeloPools.json';
import sonicCurvePools from '../../data/sonic/curvePools.json';
import sonicEulerPools from '../../data/sonic/eulerPools.json';
import sonicPendlePools from '../../data/sonic/pendlePools.json';
import sonicSwapxIchiPools from '../../data/sonic/swapxIchiPools.json';
import sonincSwapxStableLpPools from '../../data/sonic/swapxStableLpPools.json';
import { promiseArrayTiming } from '../../utils/timing.js';
import getArbitrumSiloPrices from './arbitrum/getArbitrumSiloPrices.js';
import getBalancerArbPrices from './arbitrum/getBalancerArbPrices.js';
import { getBeefyCowArbPrices } from './arbitrum/getBeefyCowArbPrices.js';
import getCurveArbitrumPrices from './arbitrum/getCurvePrices.js';
import { getGmxArbitrumPrices } from './arbitrum/getGmxPrices.js';
import { getGmxV2ArbitrumPrices } from './arbitrum/getGmxV2Prices.js';
import getHopArbPrices from './arbitrum/getHopArbPrices.js';
import { getMimSwapPrices } from './arbitrum/getMimSwapPrices.js';
import getRamsesStablePrices from './arbitrum/getRamsesStablePrices.js';
import getSolidLizardStablePrices from './arbitrum/getSolidLizardStablePrices.js';
import getStargateArbPrices from './arbitrum/getStargateArbPrices.js';
import getUniswapArbitrumPrices from './arbitrum/getUniswapPositionPrices.js';
import getVenusArbPrices from './arbitrum/getVenusArbPrices.js';
import getBalancerAvaxPrices from './avax/getBalancerPrices.js';
import { getBeefyCowAvaxPrices } from './avax/getBeefyCowAvaxPrices.js';
import { getGmxAvalanchePrices } from './avax/getGmxPrices.js';
import getStargateAvaxPrices from './avax/getStargateAvaxPrices.js';
import { getAerodromeStablePrices } from './base/getAerodromeStablePrices.js';
import getBalancerBasePrices from './base/getBalancerPrices.js';
import getBaseSiloPrices from './base/getBaseSiloPrices.js';
import { getBeefyCowBasePrices } from './base/getBeefyCowBasePrices.js';
import { getCurveBasePrices } from './base/getCurvePrices.js';
import getTokemakBasePrices from './base/getTokemakBasePrices.js';
import { getTruePrices } from './base/getTruePrices.js';
import { getBeefyCowBerachainPrices } from './berachain/getBeefyBerachainCowPrices.js';
import { getBeraswapPrices } from './berachain/getBeraswapPrices.js';
import { getKodiakPrices } from './berachain/getKodiakPrices.js';
import { getBeefyCowBscPrices } from './bsc/getBeefyCowBscPrices.js';
import getBscGammaPrices from './bsc/getBscGammaPrices.js';
import { getEllipsisPrices } from './bsc/getEllipsisPrices.js';
import getThenaStablePrices from './bsc/getThenaStablePrices.js';
import getStargateBscPrices from './bsc/stargate/getStargateBscPrices.js';
import getCantoStablePrices from './canto/getCantoStablePrices.js';
import { getCurveLendPricesCommon } from './common/curve/getCurveLendPricesCommon.js';
import getCurvePricesCommon from './common/curve/getCurvePricesCommon.js';
import { getEulerPrices } from './common/euler/getEulerPrices.js';
import { getBunniPrices } from './common/getBunniPrices.js';
import { getIchiPrices } from './common/getIchiPrices.js';
import { getMellowVeloPrices } from './common/getMellowVeloPrices.js';
import { getPendleCommonPrices } from './common/getPendleCommonPrices.js';
import getSolidlyStablePrices from './common/getSolidlyStablePrices.js';
import { getMorphoPrices } from './common/morpho/getMorphoPrices.js';
import getFerroPrices from './cronos/getFerroPrices.js';
import getAuraBalancerPrices from './ethereum/getAuraBalancerPrices.js';
import { getCurveEthereumPrices } from './ethereum/getCurvePrices.js';
import getEthSiloPrices from './ethereum/getEthereumSiloPrices.js';
import getStargateEthPrices from './ethereum/getStargateEthPrices.js';
import getTokemakEthPrices from './ethereum/getTokemakEthPrices.js';
import getUniswapEthereumGammaPrices from './ethereum/getUniswapGammaPrices.js';
import getUniswapEthereumPrices from './ethereum/getUniswapPositionPrices.js';
import getBalancerGnosisPrices from './gnosis/getBalancerGnosisPrices.js';
import { getBeefyCowGnosisPrices } from './gnosis/getBeefyGnosisCowPrices.js';
import getCurveKavaPrices from './kava/getCurvePrices.js';
import getEquilibreStablePrices from './kava/getEquilibreStablePrices.js';
import { getKinetixPrices } from './kava/getKinetixPrices.js';
import { getBeefyCowLineaPrices } from './linea/getBeefyLineaCowPrices.js';
import getGammaLineaPrices from './linea/getGammaPrices.js';
import getLynexStablePrices from './linea/getLynexStablePrices.js';
import getNileStablePrices from './linea/getNileStablePrices.js';
import getStargateLineaPrices from './linea/getStargateLineaPrices.js';
import { getBeefyCowLiskPrices } from './lisk/getBeefyLiskCowPrices.js';
import getVelodromeLiskStablePrices from './lisk/getVelodromeLiskStablePrices.js';
import { getBeefyCowMantaPrices } from './manta/getBeefyMantaCowPrices.js';
import { getBeefyCowMantlePrices } from './mantle/getBeefyMantleCowPrices.js';
import getStargateMantlePrices from './mantle/getStargateMantlePrices.js';
import getBalancerPolyPrices from './matic/getBalancerPolyPrices.js';
import { getBeefyCowPolyPrices } from './matic/getBeefyPolyCowPrices.js';
import getCurvePolygonPrices from './matic/getCurvePrices.js';
import getGammaPolygonPrices from './matic/getGammaPolygonPrices.js';
import getStargatePolygonPrices from './matic/getStargatePolygonPrices.js';
import { getBeefyCowModePrices } from './mode/getBeefyModeCowPrices.js';
import getVelodromeModeStablePrices from './mode/getVelodromeModeStablePrices.js';
import { getBeefyCowMoonbeamPrices } from './moonbeam/getBeefyCowMoonbeamPricis.js';
import { getBeefyCowOPPrices } from './optimism/getBeefyCowOPPrices.js';
import getBeetsOPPrices from './optimism/getBeetsOPPrices.js';
import getCurveOptimismPrices from './optimism/getCurvePrices.js';
import getHopOpPrices from './optimism/getHopOpPrices.js';
import getMmyOptimismPrices from './optimism/getMmyOptimismPrices.js';
import getOlpPrices from './optimism/getOlpPrices.js';
import getOptimismSiloPrices from './optimism/getOptimismSiloPrices.js';
import getStargateOpPrices from './optimism/getStargateOpPrices.js';
import getVelodromeStablePrices from './optimism/getVelodromeStablePrices.js';
import { getBeefyCowRootstockPrices } from './rootstock/getBeefyRootstockCowPrices.js';
import { getBeefyCowSagaPrices } from './saga/getBeefySagaCowPrices.js';
import { getBeefyCowScrollPrices } from './scroll/getBeefyScrollCowPrices.js';
import getNuriStablePrices from './scroll/getNuriStablePrices.js';
import getTokanStablePrices from './scroll/getTokanStablePrices.js';
import { getBeefyCowSeiPrices } from './sei/getBeefySeiCowPrices.js';
import getStargateSeiPrices from './sei/getStargateSeiPrices.js';
import { getBeefyCowSonicPrices } from './sonic/getBeefySonicCowPrices.js';
import getBeetsSonicPrices from './sonic/getBeetsSonicPrices.js';
import getEqualizerStableSonicPrices from './sonic/getEqualizerStablePrices.js';
import getSonicSiloPrices from './sonic/getSonicSiloPrices.js';
import { getBeefyCowZkSyncPrices } from './zksync/getBeefyCowZkSyncPrices.js';
import getVelocoreStablePrices from './zksync/getVelocoreStablePrices.js';
import getVenusZkPrices from './zksync/getVenusZkPrices.js';
import type { LpBreakdown } from './getAmmPrices.js';
import { isResultFulfilled } from '../../utils/promise.js';

export type NonAmmPrices = {
  prices: Record<string, number>;
  breakdown: Record<string, LpBreakdown>;
};

export async function getNonAmmPrices(
  tokenPrices: Record<string, number>,
  ammPrices: Record<string, number>,
): Promise<NonAmmPrices> {
  const prices: Record<string, number> = {};
  const breakdown: Record<string, LpBreakdown> = {};

  const promises: Promise<Record<string, number | LpBreakdown>>[] = [
    getArbitrumSiloPrices(tokenPrices),
    getEthSiloPrices(tokenPrices),
    getOptimismSiloPrices(tokenPrices),
    getSonicSiloPrices(tokenPrices),
    getEqualizerStableSonicPrices(tokenPrices),
    getKinetixPrices(tokenPrices),
    getUniswapArbitrumPrices(tokenPrices),
    getUniswapEthereumPrices(tokenPrices),
    getVelocoreStablePrices(tokenPrices),
    getMmyOptimismPrices(tokenPrices),
    getRamsesStablePrices(tokenPrices),
    getEquilibreStablePrices(tokenPrices),
    getSolidLizardStablePrices(tokenPrices),
    getCantoStablePrices(tokenPrices),
    getMimSwapPrices(tokenPrices),
    getThenaStablePrices(tokenPrices),
    getOlpPrices(),
    getStargateOpPrices(tokenPrices),
    getStargatePolygonPrices(tokenPrices),
    getStargateBscPrices(tokenPrices),
    getStargateAvaxPrices(tokenPrices),
    getStargateArbPrices(tokenPrices),
    getStargateEthPrices(tokenPrices),
    getStargateLineaPrices(tokenPrices),
    getStargateMantlePrices(tokenPrices),
    getStargateSeiPrices(tokenPrices),
    getHopOpPrices(tokenPrices),
    getHopArbPrices(tokenPrices),
    getFerroPrices(tokenPrices),
    getAuraBalancerPrices(tokenPrices),
    getGmxV2ArbitrumPrices(),
    getGmxAvalanchePrices(tokenPrices),
    getGmxArbitrumPrices(tokenPrices),
    getVelodromeStablePrices(tokenPrices),
    getVelodromeModeStablePrices(tokenPrices),
    getVelodromeLiskStablePrices(tokenPrices),
    getSolidlyStablePrices(FRX_CHAIN_ID, fraxtalVeloStablePools, tokenPrices),
    getAerodromeStablePrices(tokenPrices),
    getBalancerAvaxPrices(tokenPrices),
    getBalancerBasePrices(tokenPrices),
    getBalancerPolyPrices(tokenPrices),
    getBalancerArbPrices(tokenPrices),
    getBalancerGnosisPrices(tokenPrices),
    getBeetsSonicPrices(tokenPrices),
    getBeetsOPPrices(tokenPrices),
    getBeraswapPrices(tokenPrices),
    getKodiakPrices(tokenPrices),
    getEllipsisPrices(tokenPrices),
    getCurveEthereumPrices(tokenPrices),
    getCurvePolygonPrices(tokenPrices),
    getCurveArbitrumPrices(tokenPrices),
    getCurveLendPricesCommon(ETH_CHAIN_ID, ethCurveLendPools, tokenPrices),
    getCurveLendPricesCommon(FRX_CHAIN_ID, fraxtalCurveLendPools, tokenPrices),
    getCurveOptimismPrices(tokenPrices),
    getCurveKavaPrices(tokenPrices),
    getCurvePricesCommon(GNO_CHAIN_ID, gnosisCurvePools, tokenPrices),
    getCurvePricesCommon(FRX_CHAIN_ID, fraxtalCurvePools, tokenPrices),
    getCurvePricesCommon(SONIC_CHAIN_ID, sonicCurvePools, tokenPrices),
    getCurveBasePrices(tokenPrices),
    getBscGammaPrices(tokenPrices),
    getGammaPolygonPrices(tokenPrices),
    getUniswapEthereumGammaPrices(tokenPrices),
    getGammaLineaPrices(tokenPrices),
    getLynexStablePrices(tokenPrices),
    getNileStablePrices(tokenPrices),
    getBeefyCowArbPrices(tokenPrices),
    getBeefyCowOPPrices(tokenPrices),
    getBeefyCowBasePrices(tokenPrices),
    getBeefyCowMoonbeamPrices(tokenPrices),
    getBeefyCowLineaPrices(tokenPrices),
    getBeefyCowPolyPrices(tokenPrices),
    getBeefyCowZkSyncPrices(tokenPrices),
    getBeefyCowMantaPrices(tokenPrices),
    getBeefyCowMantlePrices(tokenPrices),
    getBeefyCowSeiPrices(tokenPrices),
    getBeefyCowBscPrices(tokenPrices),
    getBeefyCowAvaxPrices(tokenPrices),
    getBeefyCowRootstockPrices(tokenPrices),
    getBeefyCowScrollPrices(tokenPrices),
    getBeefyCowModePrices(tokenPrices),
    getBeefyCowLiskPrices(tokenPrices),
    getBeefyCowSonicPrices(tokenPrices),
    getBeefyCowBerachainPrices(tokenPrices),
    getBeefyCowGnosisPrices(tokenPrices),
    getBeefyCowSagaPrices(tokenPrices),
    getPendleCommonPrices(ARB_CHAIN_ID, arbitrumequilibriaPools, tokenPrices),
    getPendleCommonPrices(ARB_CHAIN_ID, arbitrumPendlePools, tokenPrices, {}),
    getPendleCommonPrices(ETH_CHAIN_ID, ethereumPendlePools, tokenPrices, {}),
    getPendleCommonPrices(BSC_CHAIN_ID, bscPendlePools, tokenPrices, ammPrices),
    getPendleCommonPrices(BASE_CHAIN_ID, basePendlePools, tokenPrices, ammPrices),
    getPendleCommonPrices(SONIC_CHAIN_ID, sonicPendlePools, tokenPrices),
    getMellowVeloPrices(OPTIMISM_CHAIN_ID, optimismMellowVeloPools, tokenPrices),
    getMellowVeloPrices(BASE_CHAIN_ID, baseMellowAeroPools, tokenPrices),
    getBunniPrices(BASE_CHAIN_ID, baseAlienBaseBunniPools, tokenPrices),
    getMorphoPrices(BASE_CHAIN_ID, baseMorphoPools, tokenPrices),
    getMorphoPrices(ETH_CHAIN_ID, ethMorphoPools, tokenPrices),
    getMorphoPrices(POLYGON_CHAIN_ID, polygonMorphoPools, tokenPrices),
    getIchiPrices(SONIC_CHAIN_ID, sonicSwapxIchiPools, tokenPrices),
    getSolidlyStablePrices(SONIC_CHAIN_ID, sonincSwapxStableLpPools, tokenPrices),
    getEulerPrices(SONIC_CHAIN_ID, sonicEulerPools, tokenPrices),
    getEulerPrices(AVAX_CHAIN_ID, avaxEulerPools, tokenPrices),
    getTruePrices(BASE_CHAIN_ID, baseTruePools, tokenPrices),
    getBaseSiloPrices(tokenPrices),
    getNuriStablePrices(tokenPrices),
    getTokanStablePrices(tokenPrices),
    getVenusArbPrices(tokenPrices),
    getVenusZkPrices(tokenPrices),
    getTokemakEthPrices(tokenPrices),
    getTokemakBasePrices(tokenPrices),
  ];

  // Setup error logs
  promiseArrayTiming(promises, (i) => `getNonAmmPrices[${i}]`).forEach((p, i) =>
    p.catch((e) => console.warn('getNonAmmPrices error', i, e.shortMessage ?? e.message)),
  );

  const results = await Promise.allSettled(promises);
  // results.forEach((r: any, i) => console.log(i, Object.keys(r.value)[0]));

  results
    .filter(isResultFulfilled)
    .forEach((r) => {
      Object.entries(r.value).forEach(([lp, priceOrBreakdown]) => {
        if (typeof priceOrBreakdown === 'object') {
          const lpData = priceOrBreakdown;
          prices[lp] = lpData.price;
          breakdown[lp] = lpData;
        } else {
          prices[lp] = priceOrBreakdown;
          breakdown[lp] = {
            price: priceOrBreakdown,
          };
        }
      });
    });

  return { prices, breakdown };
}

export default getNonAmmPrices;
