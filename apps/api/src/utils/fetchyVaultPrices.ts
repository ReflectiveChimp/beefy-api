import BigNumber from 'bignumber.js';
import { ChainId, type Token, addressBook } from 'blockchain-addressbook';
import YearnTokenVaultAbi from '../abis/YearnTokenVault.js';
import { fetchContract } from '../api/rpc/client.js';

const {
  fantom: {
    tokens: { WFTM, yvWFTM },
  },
} = addressBook;

const tokens = {
  fantom: [[WFTM, yvWFTM]],
} as const satisfies Record<string, [Token, Token][]>;

const getyVaultPrices = async (
  tokenPrices: Record<string, number>,
  tokens: [Token, Token][],
  chainId: ChainId,
) => {
  const pricePerShareCalls = tokens.map((token) => {
    const contract = fetchContract(token[1].address, YearnTokenVaultAbi, chainId);
    return contract.read.pricePerShare();
  });

  try {
    const res = await Promise.all(pricePerShareCalls);
    const pricePerShare = res.map((v) => new BigNumber(v.toString()));
    return pricePerShare.map((v, i) => {
      const [known, unknown] = tokens[i]!;
      const knownPrice = tokenPrices[known.oracleId] || 0;
      return {
        oracleId: unknown.oracleId,
        price: v.times(knownPrice).dividedBy('1e18').toNumber(),
      };
    });
  } catch (e) {
    console.error('getyVaultPrices', e);
    return tokens.map(([_, unknown]) => ({
      oracleId: unknown.oracleId,
      price: 0,
    }));
  }
};

export const fetchyVaultPrices = async (tokenPrices: Record<string, number>) => {
  return Promise.all([getyVaultPrices(tokenPrices, tokens.fantom, ChainId.fantom)]).then((data) =>
    data.flat().reduce(
      (acc, cur) => {
        acc[cur.oracleId] = cur.price;
        return acc;
      },
      {} as Record<string, number>,
    ),
  );
};
