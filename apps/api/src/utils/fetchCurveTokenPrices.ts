import BigNumber from 'bignumber.js';
import { ChainId, addressBookByChainId } from 'blockchain-addressbook';
import { getAddress } from 'viem';
import ICurvePoolAbi from '../abis/CurvePool.js';
import ICurvePoolV2Abi from '../abis/CurvePoolV2.js';
import type StableSwap from '../abis/StableSwap.js';
import { fetchContract } from '../api/rpc/client.js';
import arbitrumPools from '../data/arbitrum/curvePools.json';
import ethereumConvexPools from '../data/ethereum/convexPools.json';
import ethereumFxPools from '../data/ethereum/fxPools.json';
import fraxtalPools from '../data/fraxtal/curvePools.json';
import polygonPools from '../data/matic/curvePools.json';
import optimismPools from '../data/optimism/curvePools.json';

const tokens: Partial<Record<keyof typeof ChainId, CurveToken[]>> = {
  optimism: toCurveTokens(ChainId.optimism, optimismPools),
  fraxtal: toCurveTokens(ChainId.fraxtal, fraxtalPools),
  arbitrum: [
    ...toCurveTokens(ChainId.arbitrum, arbitrumPools),
    {
      oracleId: 'fETH',
      decimals: '1e18',
      index0: 0,
      index1: 2,
      pool: '0xf7fed8ae0c5b78c19aadd68b700696933b0cefd9',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolV2Abi,
    },
    {
      oracleId: 'xETH',
      decimals: '1e18',
      index0: 1,
      index1: 2,
      pool: '0xf7fed8ae0c5b78c19aadd68b700696933b0cefd9',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolV2Abi,
    },
  ],
  polygon: toCurveTokens(ChainId.polygon, [...polygonPools]),
  ethereum: [
    ...toCurveTokens(ChainId.ethereum, [
      ...ethereumConvexPools.slice().reverse(),
      ...ethereumFxPools.slice().reverse(),
    ]),
    {
      oracleId: 'msETH',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0x2d600BbBcC3F1B6Cb9910A70BaB59eC9d5F81B9A',
      secondToken: 'frxETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolAbi,
    },
    {
      oracleId: 'cvxFPIS',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0xfBB481A443382416357fA81F16dB5A725DC6ceC8',
      secondToken: 'FPIS',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolAbi,
    },
    {
      oracleId: 'sFRAX',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0xfEF79304C80A694dFd9e603D624567D470e1a0e7',
      secondToken: 'crvUSD',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolAbi,
    },
    {
      oracleId: 'MAI',
      decimals: '1e18',
      index0: 0,
      index1: 2,
      pool: '0x66E335622ad7a6C9c72c98dbfCCE684996a20Ef9',
      useUnderlying: true,
      secondToken: 'USDC',
      secondTokenDecimals: '1e6',
      abi: ICurvePoolAbi,
    },
  ],
};

type CurveToken = {
  oracleId: string;
  decimals: string;
  index0: number;
  index1: number;
  pool: `0x${string}`;
  useUnderlying?: boolean;
  secondToken: string;
  secondTokenDecimals: string;
  abi: typeof ICurvePoolV2Abi | typeof ICurvePoolAbi | typeof StableSwap;
  stableSwap?: boolean;
};

type TokenSimple = {
  oracle?: string;
  oracleId: string;
  decimals: string;
};

type TokenPool = {
  basePool: string;
  decimals: string;
  oracleId?: string;
  oracle?: string;
};

type CurvePool = {
  pool: string;
  getDy?: Array<string | number>;
  tokens: Array<TokenSimple | TokenPool>;
};

type CurvePoolWithDy = Omit<CurvePool, 'getDy'> & {
  getDy: [string, number, number] | [string, number, number, string];
};

function isTokenSimple(token: TokenSimple | TokenPool): token is TokenSimple {
  return !('basePool' in token);
}

function toCurveTokens(chainId: ChainId, pools: CurvePool[]): CurveToken[] {
  return pools
    .filter(
      (p): p is CurvePoolWithDy =>
        p.getDy !== undefined && Array.isArray(p.getDy) && (p.getDy.length === 3 || p.getDy.length === 4),
    )
    .map((p) => {
      const abi = p.getDy[0] === 'v2' ? ICurvePoolV2Abi : ICurvePoolAbi;
      const index0 = p.getDy[1];
      const index1 = p.getDy[2];
      const token0 = p.tokens[p.getDy[1]];
      const token1 = p.tokens[p.getDy[2]];
      if (!token0 || !token1) {
        console.debug(p);
        throw new Error(`Index in getDy not present in tokens`);
      }
      if (!isTokenSimple(token0)) {
        throw new Error(`token0 missing oracleId in json`);
      }

      const { oracleId, decimals } = token0;
      const underlyingTokenId = p.getDy[3];
      const underlyingAbToken = underlyingTokenId
        ? addressBookByChainId[chainId].tokens[underlyingTokenId]
        : undefined;

      if (underlyingTokenId && !underlyingAbToken) {
        throw new Error(`Underlying token ${underlyingTokenId} not present in ${chainId} addressbook`);
      }

      const secondToken = underlyingAbToken?.oracleId ?? token1.oracleId;
      const secondTokenDecimals = underlyingAbToken ? `1e${underlyingAbToken.decimals}` : token1.decimals;

      if (!secondToken) {
        throw new Error(`token1 missing oracleId in json`);
      }

      return {
        pool: getAddress(p.pool),
        abi,
        oracleId,
        decimals,
        index0,
        index1,
        useUnderlying: !!underlyingAbToken,
        secondToken,
        secondTokenDecimals,
      } satisfies CurveToken;
    });
}

async function getCurveTokenPrices(
  tokenPrices: Record<string, number>,
  chainTokens: CurveToken[],
  chainId: ChainId,
): Promise<number[]> {
  const curvePriceCalls = chainTokens.map((token) => {
    const poolContract = fetchContract(token.pool, token.abi, chainId);
    return token.stableSwap
      ? poolContract.read.calculateSwap([
          token.index0,
          token.index1,
          BigInt(new BigNumber(token.decimals).toString(10)),
        ])
      : token.useUnderlying
        ? poolContract.read.get_dy_underlying([
            BigInt(token.index0),
            BigInt(token.index1),
            BigInt(new BigNumber(token.decimals).toString(10)),
          ])
        : poolContract.read.get_dy([
            BigInt(token.index0),
            BigInt(token.index1),
            BigInt(new BigNumber(token.decimals).toString(10)),
          ]);
  });

  try {
    const res = await Promise.all(curvePriceCalls);
    const prices: number[] = [];
    const pricesById: Record<string, number> = {};
    for (let i = 0; i < res.length; i++) {
      const chainToken = chainTokens[i]!;

      pricesById[chainToken.oracleId] = new BigNumber(res[i]!.toString())
        .times(tokenPrices[chainToken.secondToken] || pricesById[chainToken.secondToken] || 0)
        .dividedBy(chainToken.secondTokenDecimals)
        .toNumber();

      prices.push(pricesById[chainToken.oracleId] || 0);
    }
    return prices;
  } catch (e) {
    console.error('getCurveTokenPrices', e);
    return chainTokens.map(() => 0);
  }
}

export async function fetchCurveTokenPrices(
  tokenPrices: Record<string, number>,
): Promise<Record<string, number>> {
  const pricesByChain: Record<string, number>[] = await Promise.all(
    Object.entries(tokens).map(async ([chainId, chainTokens]) => {
      const prices = await getCurveTokenPrices(
        tokenPrices,
        chainTokens,
        ChainId[chainId as keyof typeof ChainId],
      );
      return Object.fromEntries(chainTokens.map((token, i) => [token.oracleId, prices[i] || 0]));
    }),
  );

  return Object.assign({}, ...pricesByChain);
}
