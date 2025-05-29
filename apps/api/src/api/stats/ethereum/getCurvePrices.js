import { ETH_CHAIN_ID } from '../../../constants.js';
import convexPools from '../../../data/ethereum/convexPools.json';
import fxPools from '../../../data/ethereum/fxPools.json';
import usualCurvePools from '../../../data/ethereum/usualCurvePools.json';
import getCurvePricesCommon from '../common/curve/getCurvePricesCommon.js';

const pools = [...convexPools, ...fxPools, ...usualCurvePools];

export const getCurveEthereumPrices = async (tokenPrices) => {
  return await getCurvePricesCommon(ETH_CHAIN_ID, pools, tokenPrices);
};
