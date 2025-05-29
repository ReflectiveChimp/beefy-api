import type { Context } from 'koa';
import { pick } from 'lodash';
import { sendServiceUnavailable, sendSuccess } from '../../utils/koa.js';
import { isResultRejected } from '../../utils/promise.js';
import { getCampaignsForChainProviderWithMeta } from '../offchain-rewards/index.js';
import { isMerklCampaign } from '../offchain-rewards/typeguards.js';
import { getCowPriceRanges, initCowPriceRangeService } from './getCowPriceRanges.js';
import { initCowVaultsMetaService } from './getCowVaultsMeta.js';

export function initCowcentratedService() {
  Promise.allSettled([initCowVaultsMetaService(), initCowPriceRangeService()])
    .then((results) => {
      const failures = results.filter(isResultRejected);
      if (failures.length) {
        console.error(`> [CLM Service] ${failures.length} services failed to initialize`, failures);
      }
    })
    .catch((err) => {
      console.error('> [CLM Service] Initialization failed', err);
    });
}

export async function handleCowcentratedPriceRanges(ctx: Context) {
  const priceRanges = getCowPriceRanges();
  if (priceRanges) {
    sendSuccess(ctx, priceRanges);
  } else {
    sendServiceUnavailable(ctx, 'Not available yet');
  }
}

export async function handleCowcentratedLTIPPCampaignsForDune(ctx: Context) {
  const result = await getCampaignsForChainProviderWithMeta('arbitrum', 'merkl');
  if (!result || result.lastUpdated === 0) {
    sendServiceUnavailable(ctx, 'Not available yet');
  } else {
    const campaigns = result.campaigns
      .filter(isMerklCampaign)
      .filter((c) => c.type === 'arb-ltipp')
      .map((c) => pick(c, 'campaignId'));
    sendSuccess(ctx, campaigns, {
      maxAge: 5 * 60,
    });
  }
}
