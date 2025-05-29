import { fromWeiString, toWeiString } from '../../../../utils/big-number.js';
import type { ApiChain } from '../../../../utils/chain.js';
import { isResultFulfilled } from '../../../../utils/promise.js';
import { getOdosApi, supportedChains } from '../../api/odos/index.js';
import type { ISwapProvider, SwapRequest, SwapResponse } from './ISwapProvider.js';

export class OdosSwapProvider implements ISwapProvider {
  public readonly id = 'odos';

  supportsChain(chain: ApiChain): boolean {
    return !!supportedChains[chain];
  }

  async quotes(swaps: SwapRequest[]): Promise<SwapResponse[]> {
    if (swaps.length === 0) {
      return [];
    }

    const chainId = swaps[0]!.from.chainId;
    const api = getOdosApi(chainId);
    const results = await Promise.allSettled(
      swaps.map((swap) =>
        api.postQuote({
          inputTokens: [
            {
              tokenAddress: swap.from.address,
              amount: toWeiString(swap.fromAmount, swap.from.decimals),
            },
          ],
          outputTokens: [
            {
              tokenAddress: swap.to.address,
              proportion: 1,
            },
          ],
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

      const outAmount = result.value.outAmounts[0];
      if (outAmount === undefined) {
        return {
          from: swap.from,
          fromAmount: swap.fromAmount,
          to: swap.to,
          error: 'Undefined out amount',
        };
      }

      return {
        from: swap.from,
        fromAmount: swap.fromAmount,
        to: swap.to,
        toAmount: fromWeiString(outAmount, swap.to.decimals),
      };
    });
  }
}
