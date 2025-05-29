import type { RedisFunctions } from '@redis/client';
import {
  type RedisClientType,
  type RedisDefaultModules,
  type RedisModules,
  type RedisScripts,
  createClient,
} from 'redis';
import type { ICacheBackend } from './ICacheBackend.js';

export class RedisCacheBackend implements ICacheBackend {
  private client: RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>;

  protected constructor(url: string) {
    this.client = createClient({ url });

    this.client.on('connect', async () => {
      console.log('Connected to redis');
    });

    this.client.on('error', (err) => {
      console.error('Failed to connect to redis: ', err);
    });
  }

  public static async create(url: string): Promise<RedisCacheBackend> {
    const instance = new RedisCacheBackend(url);
    await instance.connect();
    return instance;
  }

  async get(key: string): Promise<string | undefined> {
    const value = await this.client.get(key);
    return value === null ? undefined : value;
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  protected async connect() {
    await this.client.connect();
  }
}
