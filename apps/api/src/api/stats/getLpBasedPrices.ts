import type { NonAmmPrices } from './getNonAmmPrices.js';
import type { LpBreakdown } from './getAmmPrices.js';
import { isResultFulfilled } from '../../utils/promise.js';

export async function getLpBasedPrices(
  tokenPrices: Record<string, number>,
  lpPrices: Record<string, number>,
  nonAmmPrices: NonAmmPrices,
): Promise<NonAmmPrices> {
  const prices: Record<string, number> = {};
  const breakdown: Record<string, LpBreakdown> = {};

  const promises: Promise<Record<string, number | LpBreakdown>>[] = [];
  // const promises = [
  //   getPendleCommonPrices(
  //     ARBITRUM_CHAIN_ID,
  //     arbPendlePools,
  //     tokenPrices,
  //     nonAmmPrices.prices
  //   ),
  //   getPendleCommonPrices(
  //     ETH_CHAIN_ID,
  //     ethPendlePools,
  //     tokenPrices,
  //     nonAmmPrices.prices
  //   ),
  //   getPendleCommonPrices(
  //     ARBITRUM_CHAIN_ID,
  //     arbPendlePools,
  //     tokenPrices,
  //     nonAmmPrices.prices
  //   ),
  // ];

  // Setup error logs
  promises.forEach((p, i) =>
    p.catch((e) => console.warn('getLpBasedPrices error', i, e.shortMessage ?? e.message)),
  );

  const results = await Promise.allSettled(promises);

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
