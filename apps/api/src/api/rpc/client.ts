import type { Abi } from 'abitype';
import type { ChainId } from 'blockchain-addressbook';
import PQueue from 'p-queue';
import {
  http,
  type Client,
  type HttpTransport,
  type HttpTransportConfig,
  type PublicClient,
  createClient,
  createPublicClient,
  getContract,
} from 'viem';
import { envBoolean, envNumber } from '../../utils/env.js';
import { getChain } from './chains.js';
import { type CustomFallbackTransport, customFallback } from './fallbackTransport.js';
import { rateLimitedHttp } from './transport.js';

const multicallClientsByChain: Record<number, Client> = {};
const singleCallClientsByChain: Record<number, Client> = {};

const publicClientsByChain: Record<number, PublicClient> = {};
const queueByDomain: Record<string, PQueue> = {};

/**
 * Return a new queue per domain
 * @param rpcUrl
 */
function getQueueFor(rpcUrl: string): PQueue {
  const { hostname } = new URL(rpcUrl);
  if (!queueByDomain[hostname]) {
    // Default: Max 5 requests per second with 2 active requests
    queueByDomain[hostname] = new PQueue({
      concurrency: envNumber('RPC_RATE_LIMIT_CONCURRENCY', 2),
      intervalCap: envNumber('RPC_RATE_LIMIT_INTERVAL_CAP', 5),
      interval: envNumber('RPC_RATE_LIMIT_INTERVAL', 1000),
      carryoverConcurrencyCount: true,
      autoStart: true,
      timeout: 30 * 1000,
      throwOnTimeout: true,
    });
  }

  return queueByDomain[hostname];
}

function makeHttpTransport(url: string, config: HttpTransportConfig = {}): HttpTransport {
  // Default: disable rate limiting
  if (envBoolean('RPC_RATE_LIMIT', false)) {
    const queue = getQueueFor(url);
    return rateLimitedHttp(queue, url, config);
  }

  return http(url, config);
}

function makeCustomFallbackTransport(rpcUrls: string[] | readonly string[]): CustomFallbackTransport {
  const transports = rpcUrls.map((url: string) =>
    makeHttpTransport(url, {
      timeout: 15000,
      retryCount: 5,
      retryDelay: 100,
    }),
  );
  return customFallback(transports, { rank: true });
}

export const getMulticallClientForChain = (chainId: ChainId): Client => {
  const chain = getChain[chainId];
  if (!chain) throw new Error('Unknown chainId ' + chainId);
  return (multicallClientsByChain[chain.id] ??= createClient({
    batch: {
      multicall: {
        batchSize: 1024,
        wait: envNumber('BATCH_WAIT', 1500),
      },
    },
    chain: chain,
    transport: makeCustomFallbackTransport(chain.rpcUrls.default.http),
  }));
};

const getPublicClientForChain = (chainId: ChainId): PublicClient => {
  const chain = getChain[chainId];
  if (!chain) throw new Error('Unknown chainId ' + chainId);

  return (publicClientsByChain[chain.id] ??= createPublicClient({
    batch: {
      multicall: {
        batchSize: 1024,
        wait: envNumber('BATCH_WAIT', 1500),
      },
    },
    chain: chain,
    transport: makeCustomFallbackTransport(chain.rpcUrls.default.http),
  }));
};

const getSingleCallClientForChain = (chainId: ChainId): Client => {
  const chain = getChain[chainId];
  if (!chain) throw new Error('Unknown chainId ' + chainId);

  return (singleCallClientsByChain[chain.id] ??= createClient({
    chain: chain,
    transport: makeCustomFallbackTransport(chain.rpcUrls.default.http),
  }));
};

export const fetchContract = <ContractAbi extends Abi>(
  address: string,
  abi: ContractAbi,
  chainId: ChainId,
) => {
  const client = getMulticallClientForChain(chainId);
  return getContract({ address: address as `0x${string}`, abi, client });
};

export const fetchNoMulticallContract = <ContractAbi extends Abi>(
  address: string,
  abi: ContractAbi,
  chainId: ChainId,
) => {
  const client = getSingleCallClientForChain(chainId);
  return getContract({ address: address as `0x${string}`, abi, client });
};

export const getRPCClient = (chainId: ChainId): PublicClient => getPublicClientForChain(chainId);
