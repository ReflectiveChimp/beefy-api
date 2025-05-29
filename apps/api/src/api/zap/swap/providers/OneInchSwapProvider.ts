import { fromWeiString, toWeiString } from '../../../../utils/big-number.js';
import type { ApiChain } from '../../../../utils/chain.js';
import { isResultFulfilled } from '../../../../utils/promise.js';
import { getOneInchSwapApi, supportedSwapChains } from '../../api/one-inch/index.js';
import type { ISwapProvider, SwapRequest, SwapResponse } from './ISwapProvider.js';

export class OneInchSwapProvider implements ISwapProvider {
  public readonly id = 'one-inch';

  supportsChain(chain: ApiChain): boolean {
    return supportedSwapChains[chain] || false;
  }

  async quotes(swaps: SwapRequest[]): Promise<SwapResponse[]> {
    if (swaps.length === 0) {
      return [];
    }

    const chainId = swaps[0]!.from.chainId;
    const api = getOneInchSwapApi(chainId);
    const results = await Promise.allSettled(
      swaps.map((swap) =>
        api.getQuote({
          src: swap.from.address,
          dst: swap.to.address,
          amount: toWeiString(swap.fromAmount, swap.from.decimals),
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

      const quote = result.value;
      return {
        from: swap.from,
        fromAmount: swap.fromAmount,
        to: swap.to,
        toAmount: fromWeiString(quote.dstAmount, quote.dstToken.decimals),
      };
    });
  }
}
