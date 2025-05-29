import type PQueue from 'p-queue';
import type { ApiChain } from '../../../../utils/chain.js';
import type { ApiResponse } from '../common.js';
import { OdosApi } from './OdosApi.js';

export class RateLimitedOdosApi extends OdosApi {
  constructor(
    baseUrl: string,
    apiKey: string,
    chain: ApiChain,
    protected readonly queue: PQueue,
  ) {
    super(baseUrl, apiKey, chain);
  }

  protected override async post<ResponseType extends object>(
    path: string,
    request: Record<string, string>,
  ): Promise<ApiResponse<ResponseType>> {
    return this.queue.add(() => super.post(path, request));
  }

  protected override async priorityPost<ResponseType extends object>(
    path: string,
    request: Record<string, unknown>,
  ): Promise<ApiResponse<ResponseType>> {
    // Rate limit, but higher priority than normal post, as these are used for app api proxy
    return this.queue.add(() => super.priorityPost(path, request), {
      priority: 2,
    });
  }
}
