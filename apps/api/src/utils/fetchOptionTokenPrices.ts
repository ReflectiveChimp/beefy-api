import BigNumber from 'bignumber.js';
import { ChainId, type Token, addressBook } from 'blockchain-addressbook';
import OptionsToken from '../abis/OptionsToken.js';
import { fetchContract } from '../api/rpc/client.js';

const {
  fantom: {
    tokens: { FVM, oFVM },
  },
  base: {
    tokens: { BVM, oBVM },
  },
  canto: {
    tokens: { CVM, oCVM },
  },
  linea: {
    tokens: { LYNX, oLYNX },
  },
} = addressBook;

const tokens = {
  fantom: [[FVM, oFVM]],
  base: [[BVM, oBVM]],
  canto: [[CVM, oCVM]],
  linea: [[LYNX, oLYNX]],
} as const satisfies Record<string, [Token, Token][]>;

const hundred = new BigNumber(100);

const getOptionTokenPrices = async (
  tokenPrices: Record<string, number>,
  tokens: [Token, Token][],
  chainId: ChainId,
) => {
  const discountCalls = tokens.map((token) => {
    const contract = fetchContract(token[1].address, OptionsToken, chainId);
    return contract.read.discount();
  });

  try {
    const [discountCallResults] = await Promise.all([Promise.all(discountCalls)]);

    const discount = discountCallResults.map((v) => new BigNumber(v.toString()));

    return discount.map((v, i) => {
      const [known, unknown] = tokens[i]!;
      const knownPrice = tokenPrices[known.oracleId] || 0;
      return {
        oracleId: unknown.oracleId,
        price: new BigNumber(knownPrice).times(hundred.minus(v)).dividedBy(hundred).toNumber(),
      };
    });
  } catch (e) {
    console.error('getOptionTokenPrices', e);
    return tokens.map(([_, unknown]) => ({
      oracleId: unknown.oracleId,
      price: 0,
    }));
  }
};

export async function fetchOptionTokenPrices(
  tokenPrices: Record<string, number>,
): Promise<Record<string, number>> {
  return Promise.all([
    getOptionTokenPrices(tokenPrices, tokens.fantom, ChainId.fantom),
    getOptionTokenPrices(tokenPrices, tokens.base, ChainId.base),
    getOptionTokenPrices(tokenPrices, tokens.canto, ChainId.canto),
    getOptionTokenPrices(tokenPrices, tokens.linea, ChainId.linea),
  ]).then((data) =>
    data.flat().reduce(
      (acc, cur) => {
        acc[cur.oracleId] = cur.price;
        return acc;
      },
      {} as Record<string, number>,
    ),
  );
}
