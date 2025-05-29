import type Koa from 'koa';
import type { AnyChain } from '../../../utils/chain.js';
import { errorToString } from '../../../utils/error.js';
import { redactSecrets } from '../../../utils/secrets.js';
import { type ApiResponse, isSuccessApiResponse } from '../api/common.js';
import { getOdosApi } from '../api/odos/index.js';
import type { QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from '../api/odos/types.js';
import { setNoCacheHeaders } from './common.js';

const postProxiedQuote = async (
  request: QuoteRequest,
  chain: AnyChain,
): Promise<ApiResponse<QuoteResponse>> => {
  try {
    const api = getOdosApi(chain);
    return await api.postProxiedQuote(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(errorToString(err)),
    };
  }
};

export async function proxyOdosQuote(ctx: Koa.Context) {
  const start = Date.now();
  const chain = ctx.params.chainId;
  const requestObject: QuoteRequest = ctx.request['body'] as any;
  const proxiedQuote = await postProxiedQuote(requestObject, chain);
  if (isSuccessApiResponse(proxiedQuote)) {
    console.log(`proxyOdosQuote took ${(Date.now() - start) / 1000}s on ${chain}`);
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedQuote.code;
  ctx.body = isSuccessApiResponse(proxiedQuote) ? proxiedQuote.data : proxiedQuote.message;
}

const postProxiedSwap = async (request: SwapRequest, chain: AnyChain): Promise<ApiResponse<SwapResponse>> => {
  try {
    const api = getOdosApi(chain);
    return await api.postProxiedSwap(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(errorToString(err)),
    };
  }
};

export async function proxyOdosSwap(ctx: Koa.Context) {
  const start = Date.now();
  const chain = ctx.params.chainId;
  const requestObject: SwapRequest = ctx.request['body'] as any;
  const proxiedSwap = await postProxiedSwap(requestObject, chain);
  if (isSuccessApiResponse(proxiedSwap)) {
    console.log(`proxyOdosSwap took ${(Date.now() - start) / 1000}s on ${chain}`);
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.code;
  ctx.body = isSuccessApiResponse(proxiedSwap) ? proxiedSwap.data : proxiedSwap.message;
}
