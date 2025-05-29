import { fromWeiString, toWeiString } from '../../../../utils/big-number.js';
import type { ApiChain } from '../../../../utils/chain.js';
import { isResultFulfilled } from '../../../../utils/promise.js';
import { getKyberApi, supportedChains } from '../../api/kyber/index.js';
import type { ISwapProvider, SwapRequest, SwapResponse } from './ISwapProvider.js';

export class KyberSwapProvider implements ISwapProvider {
  public readonly id = 'kyber';

  supportsChain(chain: ApiChain): boolean {
    return !!supportedChains[chain];
  }

  async quotes(swaps: SwapRequest[]): Promise<SwapResponse[]> {
    if (swaps.length === 0) {
      return [];
    }

    const chainId = swaps[0]!.from.chainId;
    const api = getKyberApi(chainId);
    const results = await Promise.allSettled(
      swaps.map((swap) =>
        api.getQuote({
          tokenIn: swap.from.address,
          tokenOut: swap.to.address,
          amountIn: toWeiString(swap.fromAmount, swap.from.decimals),
        }),
      ),
    );

    return results.map((result, index) => {
      const swap = swaps[index]!;

      if (!isResultFulfilled(result)) {
        return {
          from: swap.from,
          fromAmount: swap.fromAmount,
          to: swap.to,
          error: result.reason?.message || 'Unknown request error',
        };
      }

      const quote = result.value.routeSummary;
      return {
        from: swap.from,
        fromAmount: swap.fromAmount,
        to: swap.to,
        toAmount: fromWeiString(quote.amountOut, swap.to.decimals),
      };
    });
  }
}
