import type PQueue from 'p-queue';
import type { ApiChain } from '../../../../utils/chain.js';
import type { ApiResponse } from '../common.js';
import { OneInchSwapApi } from './OneInchSwapApi.js';

export class RateLimitedOneInchSwapApi extends OneInchSwapApi {
  constructor(
    baseUrl: string,
    apiKey: string,
    protected readonly queue: PQueue,
    chain: ApiChain,
  ) {
    super(baseUrl, apiKey, chain);
  }

  protected override async get<ResponseType extends object>(
    path: string,
    request?: Record<string, string>,
  ): Promise<ApiResponse<ResponseType>> {
    return this.queue.add(() => super.get(path, request));
  }

  protected override async priorityGet<ResponseType extends object>(
    path: string,
    request?: Record<string, string>,
  ): Promise<ApiResponse<ResponseType>> {
    // Rate limit, but higher priority than normal get, as these are used for app api proxy
    return this.queue.add(() => super.priorityGet(path, request), {
      priority: 1,
    });
  }
}
