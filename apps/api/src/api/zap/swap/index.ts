import { groupBy, mapValues, partition } from 'lodash';
import PQueue from 'p-queue';
import { serviceEventBus } from '../../../utils/ServiceEventBus.js';
import { type ApiChain, ApiChains } from '../../../utils/chain.js';
import { isResultFulfilled } from '../../../utils/promise.js';
import { sleep } from '../../../utils/time.js';
import { DataLayer } from './DataLayer.js';
import { fetchProviderSupportForChainTokens, getProvidersForChain } from './fetch.js';
import type { ProviderId } from './providers/index.js';
import type { ProviderSupportByChainByAddress } from './types.js';

const MIN_UPDATE_DELAY = 30 * 60 * 1000; // 30 minutes; actual update runs after next price update
const DATA_DELETE_AFTER = 4 * 60 * 60 * 1000; // 4 hours; delete provider token support +/- DATA_GC_INTERVAL
const DATA_GC_INTERVAL = 60 * 60 * 1000; // 1 hour; garbage collect provider token support every hour
const CACHE_KEY_ROOT = 'zap/swaps';
const SWAP_TEST_AMOUNT = 1000; // Test swaps with $1000 in native
const MAX_PRICE_IMPACT = 0.1; // Allow for 10% price impact + fees for zap swaps before disabling that token
const LOG_PER_CHAIN_PROVIDER = true;

const dataLayer = new DataLayer(CACHE_KEY_ROOT, DATA_DELETE_AFTER, DATA_GC_INTERVAL);

async function updateChainProvider(apiChain: ApiChain, providerId: ProviderId) {
  const start = Date.now();
  if (LOG_PER_CHAIN_PROVIDER) {
    console.log(`> [Zap] Swap service update started for ${apiChain} ${providerId}`);
  }

  const supportByAddress = await fetchProviderSupportForChainTokens(
    providerId,
    apiChain,
    MAX_PRICE_IMPACT,
    SWAP_TEST_AMOUNT,
  );

  // Save to locally and cache to redis
  await dataLayer.set(apiChain, providerId, supportByAddress);

  if (LOG_PER_CHAIN_PROVIDER) {
    console.log(
      `> [Zap] Swap service update completed for ${apiChain} ${providerId} in ${(Date.now() - start) / 1000}s`,
    );
  }
}

async function performUpdate() {
  console.log(`> [Zap] Swap service update started`);
  try {
    const start = Date.now();

    const updates = ApiChains.reduce(
      (acc, apiChain) => {
        const providers = getProvidersForChain(apiChain);
        providers.forEach((providerId) => acc.push({ apiChain, providerId }));
        return acc;
      },
      [] as { apiChain: ApiChain; providerId: ProviderId }[],
    );

    // Run updates in parallel per provider
    const queue = mapValues(
      groupBy(updates, 'providerId'),
      () => new PQueue({ concurrency: 1, autoStart: true }),
    );
    const results = await Promise.allSettled(
      updates.map(({ apiChain, providerId }) =>
        queue[providerId]!.add(() => updateChainProvider(apiChain, providerId)),
      ),
    );

    const timing = (Date.now() - start) / 1000;
    const [fulfilled, rejected] = partition(results, isResultFulfilled);

    console.log(
      `> [Zap] Swap service update completed in ${timing}s, successes: ${fulfilled.length}, failures: ${rejected.length}`,
    );
    if (rejected.length) {
      rejected.forEach(({ reason }) => console.error(`- `, reason));
    }
  } catch (err) {
    console.error(`> [Zap] Swap service update failed`, err);
  } finally {
    scheduleUpdate();
  }
}

function scheduleUpdate() {
  waitForNewData()
    .then(performUpdate)
    .catch((err) => {
      console.error(`> [Zap] Swap service waitForNewData failed`, err);
      scheduleUpdate();
    });
}

async function waitForNewData() {
  // Wait at least this long
  await sleep(MIN_UPDATE_DELAY);
  // Then run on the first prices update after vaults are updated (adds 0-10 minute delay to above)
  // This ensures prices are most accurate which is needed as we use prices to determine if a token is supported
  await serviceEventBus.waitForNextEvent('vaults/updated');
  await serviceEventBus.waitForNextEvent('prices/updated');
}

async function waitForInitialDependencies() {
  return Promise.all([
    serviceEventBus.waitForFirstEvent('vaults/updated'),
    serviceEventBus.waitForFirstEvent('boosts/updated'),
    serviceEventBus.waitForFirstEvent('tokens/updated'),
    serviceEventBus.waitForFirstEvent('prices/updated'),
  ]);
}

export async function initZapSwapService() {
  // Load from cache
  await loadFromCache();
  // Wait for all data to be ready
  await waitForInitialDependencies();
  // Update now
  await performUpdate();
}

async function loadFromCache() {
  await dataLayer.loadFromCache();
}

export function getTokenSwapSupport(): ProviderSupportByChainByAddress {
  return dataLayer.getProviderSupport();
}

export function getDebugTokenSwapSupport() {
  return dataLayer.getTokenSupport();
}
