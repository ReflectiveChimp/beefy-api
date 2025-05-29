import type Koa from 'koa';
import type { AnyChain } from '../../../utils/chain.js';
import { errorToString } from '../../../utils/error.js';
import { redactSecrets } from '../../../utils/secrets.js';
import { type ApiResponse, isSuccessApiResponse } from '../api/common.js';
import { getOneInchSwapApi } from '../api/one-inch/index.js';
import type { QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from '../api/one-inch/types.js';
import { isQuoteValueTooLow, setNoCacheHeaders } from './common.js';

const getProxiedSwap = async (request: SwapRequest, chain: AnyChain): Promise<ApiResponse<SwapResponse>> => {
  try {
    const api = getOneInchSwapApi(chain);
    return await api.getProxiedSwap(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(errorToString(err)),
    };
  }
};

const getProxiedQuote = async (
  request: QuoteRequest,
  chain: AnyChain,
): Promise<ApiResponse<QuoteResponse>> => {
  try {
    const tooLowError = await isQuoteValueTooLow(request.amount, request.src, chain);
    if (tooLowError) {
      return tooLowError;
    }

    const api = getOneInchSwapApi(chain);
    return await api.getProxiedQuote(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(errorToString(err)),
    };
  }
};

export async function proxyOneInchSwap(ctx: Koa.Context) {
  const start = Date.now();
  const chain = ctx.params.chainId;
  const requestObject: SwapRequest = ctx.query as any;
  const proxiedSwap = await getProxiedSwap(requestObject, chain);
  if (isSuccessApiResponse(proxiedSwap)) {
    console.log(`proxyOneInchSwap took ${(Date.now() - start) / 1000}s on ${chain}`);
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.code;
  ctx.body = isSuccessApiResponse(proxiedSwap) ? proxiedSwap.data : proxiedSwap.message;
}

export async function proxyOneInchQuote(ctx: Koa.Context) {
  const start = Date.now();
  const chain = ctx.params.chainId;
  const requestObject: QuoteRequest = ctx.query as any;
  const proxiedQuote = await getProxiedQuote(requestObject, chain);
  if (isSuccessApiResponse(proxiedQuote)) {
    console.log(`proxyOneInchQuote took ${(Date.now() - start) / 1000}s on ${chain}`);
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedQuote.code;
  ctx.body = isSuccessApiResponse(proxiedQuote) ? proxiedQuote.data : proxiedQuote.message;
}
