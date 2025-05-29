import { envBoolean, envString } from '../env.js';
import { Cache } from './Cache.js';
import { DummyCacheBackend } from './DummyCacheBackend.js';
import { FileCacheBackend } from './FileCacheBackend.js';
import type { ICacheBackend } from './ICacheBackend.js';
import { RedisCacheBackend } from './RedisCacheBackend.js';

const REDISCLOUD_URL = envString('REDISCLOUD_URL');
const FILE_CACHE_BACKEND = envBoolean('FILE_CACHE_BACKEND', false);

let cache: Cache | undefined;

export async function initCache() {
  if (cache) return;

  let backend: ICacheBackend | undefined;

  // Redis backend
  if (REDISCLOUD_URL) {
    console.log('> Using Redis cache backend');
    backend = await RedisCacheBackend.create(REDISCLOUD_URL);
  }

  // File backend
  if (!backend && FILE_CACHE_BACKEND) {
    console.log('> Using file cache backend');
    backend = new FileCacheBackend();
  }

  // Fallback backend
  if (!backend) {
    console.log('> No cache backend specified, cache disabled');
    backend = new DummyCacheBackend();
  }

  cache = new Cache(backend);
}

export async function setKey<T>(key: string, value: T): Promise<void> {
  if (!cache) {
    throw new Error('Cache not initialized');
  }
  await cache.set(key, value);
}

export async function getKey<T>(key: string): Promise<T | undefined> {
  if (!cache) {
    throw new Error('Cache not initialized');
  }
  return cache.get<T>(key);
}

export async function deleteKey<T>(key: string): Promise<void> {
  if (!cache) {
    throw new Error('Cache not initialized');
  }
  await cache.delete(key);
}
