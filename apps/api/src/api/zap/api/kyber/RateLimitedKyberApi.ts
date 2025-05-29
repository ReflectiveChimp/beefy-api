import type PQueue from 'p-queue';
import type { ApiChain } from '../../../../utils/chain.js';
import type { ApiResponse } from '../common.js';
import { KyberApi } from './KyberApi.js';

export class RateLimitedKyberApi extends KyberApi {
  constructor(
    baseUrl: string,
    clientId: string,
    protected readonly queue: PQueue,
    chain: ApiChain,
  ) {
    super(baseUrl, clientId, chain);
  }

  protected override async get<ResponseType extends object>(
    path: string,
    request?: Record<string, string>,
  ): Promise<ApiResponse<ResponseType>> {
    return this.queue.add(() => super.get(path, request));
  }

  protected override async priorityGet<ResponseType extends object>(
    path: string,
    request: Record<string, string>,
  ): Promise<ApiResponse<ResponseType>> {
    // Rate limit, but higher priority than normal get, as these are used for app api proxy
    return this.queue.add(() => super.priorityGet(path, request), {
      priority: 1,
    });
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
