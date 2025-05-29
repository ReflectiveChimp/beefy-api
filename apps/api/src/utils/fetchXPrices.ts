import BigNumber from 'bignumber.js';
import { ChainId, type Token, addressBook } from 'blockchain-addressbook';
import ERC20Abi from '../abis/ERC20Abi.js';
import { fetchContract } from '../api/rpc/client.js';

const {
  fantom: {
    tokens: { BOO, xBOO, SCREAM, xSCREAM, CREDIT, xCREDIT },
  },
  polygon: {
    tokens: { newQUICK, newdQUICK },
  },
  fuse: {
    tokens: { VOLT, xVOLT },
  },
  moonbeam: {
    tokens: { STELLA, xSTELLA },
  },
  aurora: {
    tokens: { TRI, xTRI },
  },
} = addressBook;

const tokens = {
  fantom: [
    [BOO, xBOO],
    [SCREAM, xSCREAM],
    [CREDIT, xCREDIT],
  ],
  polygon: [[newQUICK, newdQUICK]],
  fuse: [[VOLT, xVOLT]],
  moonbeam: [[STELLA, xSTELLA]],
  aurora: [[TRI, xTRI]],
} as const satisfies Record<string, [Token, Token][]>;

const getXPrices = async (
  tokenPrices: Record<string, number>,
  tokens: [Token, Token][],
  chainId: ChainId,
) => {
  const stakedInXPoolCalls = tokens.map((token) => {
    const contract = fetchContract(token[0].address, ERC20Abi, chainId);
    return contract.read.balanceOf([token[1].address as `0x${string}`]);
  });
  const totalXSupplyCalls = tokens.map((token) => {
    const contract = fetchContract(token[1].address, ERC20Abi, chainId);
    return contract.read.totalSupply();
  });

  try {
    const [xPoolResults, totalXSupplyResults] = await Promise.all([
      Promise.all(stakedInXPoolCalls),
      Promise.all(totalXSupplyCalls),
    ]);

    const stakedInXPool = xPoolResults.map((v) => new BigNumber(v.toString()));
    const totalXSupply = totalXSupplyResults.map((v) => new BigNumber(v.toString()));

    return stakedInXPool.map((v, i) => {
      const [known, unknown] = tokens[i]!;
      const knownPrice = tokenPrices[known.oracleId] || 0;
      return {
        oracleId: unknown.oracleId,
        price: v.times(knownPrice).dividedBy(totalXSupply[i]!).toNumber(),
      };
    });
  } catch (e) {
    console.error('getXPrices', e);
    return tokens.map(([_, unknown]) => ({
      oracleId: unknown.oracleId,
      price: 0,
    }));
  }
};

export async function fetchXPrices(tokenPrices: Record<string, number>): Promise<Record<string, number>> {
  return Promise.all([
    getXPrices(tokenPrices, tokens.fantom, ChainId.fantom),
    getXPrices(tokenPrices, tokens.polygon, ChainId.polygon),
    getXPrices(tokenPrices, tokens.fuse, ChainId.fuse),
    getXPrices(tokenPrices, tokens.moonbeam, ChainId.moonbeam),
    getXPrices(tokenPrices, tokens.aurora, ChainId.aurora),
  ]).then((data) =>
    data.flat().reduce(
      (acc, cur, i) => {
        acc[cur.oracleId] = cur.price;
        return acc;
      },
      {} as Record<string, number>,
    ),
  );
}
