import BigNumber from 'bignumber.js';
import type { ApiChain } from '../../../utils/chain.js';
import { errorToString } from '../../../utils/error.js';
import { type ISwapProvider, type SwapRequest, isSwapResponseFailure } from './providers/ISwapProvider.js';
import type { ProviderId } from './providers/index.js';
import type { SellResult, SellTestToken, TokenWithPrice } from './types.js';

export async function checkSell(
  provider: ISwapProvider,
  providerKey: ProviderId,
  apiChain: ApiChain,
  wnative: TokenWithPrice,
  tokens: SellTestToken[],
  sellValue: number,
  minOutputRatio: number,
): Promise<SellResult[]> {
  const expectedOutput = new BigNumber(sellValue / wnative.price); // $1000 in native token
  const minOutput = expectedOutput
    .times(minOutputRatio)
    .decimalPlaces(wnative.token.decimals, BigNumber.ROUND_FLOOR);

  const requests: SwapRequest[] = tokens.map((token) => ({
    from: token.token,
    fromAmount: new BigNumber(sellValue / token.price),
    to: wnative.token,
  }));

  try {
    const results = await provider.quotes(requests);
    return results.map((result, i) => {
      const tokenWithPrice = tokens[i]!;

      if (isSwapResponseFailure(result)) {
        return { supported: false, tokenWithPrice, reason: result.error };
      }

      const actualOutput = result.toAmount;
      if (actualOutput.gte(minOutput)) {
        return { supported: true, tokenWithPrice, output: actualOutput };
      }

      return {
        supported: false,
        tokenWithPrice,
        reason: `Sell output amount is less than expected [a=${actualOutput.toString(
          10,
        )}, e=${expectedOutput.toString(10)}, m=${minOutput.toString(10)}, f=${result.fromAmount.toString(
          10,
        )} n=${wnative.price.toString(10)}, t=${tokenWithPrice.price.toString(10)}]`,
      };
    });
  } catch (err) {
    console.error(
      `> [Zap] Error while checking sell with swap provider ${providerKey} on chain ${apiChain}`,
      err,
    );
    const reason = errorToString(err, 'Unknown swap provider error');
    return tokens.map((tokenWithPrice) => ({
      supported: false,
      tokenWithPrice,
      reason,
    }));
  }
}
