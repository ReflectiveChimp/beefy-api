import BigNumber from 'bignumber.js';
import type { ChainId } from 'blockchain-addressbook';
import { uniq } from 'lodash';
import BeefyVaultV6Abi from '../abis/BeefyVault.js';
import { fetchContract } from '../api/rpc/client.js';

type MooPool = {
  name: string;
  address: string;
  decimals: string;
  chainId: ChainId;
  oracle: string;
  oracleId: string;
  ppfs?: BigNumber;
};

export async function fetchMooPrices(
  pools: MooPool[],
  tokenPrices: Record<string, number>,
  lpPrices: Record<string, number>,
): Promise<Record<string, number>> {
  let moo: Record<string, number> = {};

  await fetchPpfs(pools);

  for (let i = 0; i < pools.length; i++) {
    const mooPrice = calcMooPrice(pools[i], tokenPrices, lpPrices);
    moo = { ...moo, ...mooPrice };
  }

  return moo;
}

const fetchPpfs = async (pools: MooPool[]) => {
  const chainIds: ChainId[] = uniq(pools.map((p) => p.chainId));

  for (const chainId of chainIds) {
    const filtered = pools.filter((p) => p.chainId == chainId);

    const ppfsCalls = filtered.map((pool) => {
      const contract = fetchContract(pool.address, BeefyVaultV6Abi, chainId);
      return contract.read.getPricePerFullShare();
    });

    try {
      const res = await Promise.all(ppfsCalls);
      const ppfss = res.map((v) => new BigNumber(v.toString()));

      for (let i = 0; i < ppfss.length; i++) {
        filtered[i]!.ppfs = ppfss[i];
      }
    } catch (e) {
      console.error('fetchMooPrices', e);
    }
  }
};

function calcMooPrice(
  pool: any,
  tokenPrices: Record<string, number>,
  lpPrices: Record<string, number>,
): Record<string, number> {
  const price = pool.oracle == 'tokens' ? tokenPrices[pool.oracleId] : lpPrices[pool.oracleId];
  const mooPrice = pool.ppfs.times(price).dividedBy(pool.decimals);
  return { [pool.name]: mooPrice.toNumber() };
}
