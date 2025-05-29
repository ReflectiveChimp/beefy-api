import type { ICacheBackend } from './ICacheBackend.js';

export class DummyCacheBackend implements ICacheBackend {
  async get(key: string): Promise<string | undefined> {
    return undefined;
  }

  async set(key: string, value: string): Promise<void> {
    return;
  }

  async delete(key: string): Promise<void> {
    return;
  }
}
