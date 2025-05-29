import BigNumber from 'bignumber.js';
import type { ChainId } from 'blockchain-addressbook';
import ERC20Abi from '../../abis/ERC20Abi.js';
import MulticallAbi from '../../abis/common/Multicall/MulticallAbi.js';
import { BIG_ZERO } from '../../utils/big-number.js';
import { MULTICALL_V3 } from '../../utils/multicallHelpers.js';
import { fetchContract } from '../rpc/client.js';
import { type LpBreakdown, getLpBreakdownForOracle } from '../stats/getAmmPrices.js';
import { getLockedAssetBalanceCall } from './lockedAssetHelpers.js';
import {
  type AssetBalance,
  type ChainTreasuryBalance,
  type TreasuryApiResult,
  type TreasuryAsset,
  type TreasuryWallet,
  isConcLiquidityAsset,
  isLockedAsset,
  isNativeAsset,
  isTokenAsset,
  isValidatorAsset,
  isVaultAsset,
} from './types.js';
import { getValidatorBalanceCall } from './validatorHelpers.js';

export const mapAssetToCall = (
  asset: TreasuryAsset,
  treasuryAddressesForChain: TreasuryWallet[],
  chainId: ChainId,
) => {
  if (isTokenAsset(asset) || isVaultAsset(asset)) {
    const contract = fetchContract(asset.address, ERC20Abi, chainId);
    return treasuryAddressesForChain.map((treasuryData) =>
      contract.read.balanceOf([treasuryData.address as `0x${string}`]),
    );
  } else if (isNativeAsset(asset)) {
    const multicallAddress = MULTICALL_V3[chainId];
    if (!multicallAddress) {
      throw new Error(`MULTICALL_V3 not found for ${chainId}`);
    }
    const multicallContract = fetchContract(multicallAddress, MulticallAbi, chainId);
    return treasuryAddressesForChain.map((treasuryData) =>
      multicallContract.read.getEthBalance([treasuryData.address as `0x${string}`]),
    );
  } else if (isConcLiquidityAsset(asset)) {
    return [getLpBreakdownForOracle(asset.oracleId)];
  } else if (isValidatorAsset(asset)) {
    return getValidatorBalanceCall(asset, chainId);
  } else if (isLockedAsset(asset)) {
    return treasuryAddressesForChain.map((treasuryData) => {
      return getLockedAssetBalanceCall(asset, chainId, treasuryData.address);
    });
  }

  throw new Error(`Unhandled asset type`);
};

export const extractBalancesFromTreasuryCallResults = (
  apiAssets: TreasuryAsset[],
  treasuryAddresses: string[],
  callResults: PromiseSettledResult<bigint[] | LpBreakdown[] | TreasuryApiResult[]>[],
): ChainTreasuryBalance => {
  if (callResults.length !== apiAssets.length) {
    throw new Error(`call results / api assets length mis-match`);
  }

  const allBalances: AssetBalance[] = [];
  apiAssets.forEach((asset, i) => {
    const callResult = callResults[i]!;
    if (callResult.status === 'fulfilled') {
      if (isTokenAsset(asset) || isVaultAsset(asset) || isNativeAsset(asset) || isLockedAsset(asset)) {
        const value = callResult.value as bigint[];
        if (value.length !== treasuryAddresses.length) {
          throw new Error(`call result / treasuryAddresses length mis-match`);
        }
        const bal = {
          address: asset.address.toLowerCase(),
          balances: {} as Record<string, BigNumber>,
        };
        treasuryAddresses.forEach((treasuryAddress, j) => {
          bal.balances[treasuryAddress.toLowerCase()] = new BigNumber(value[j]!.toString());
        });
        allBalances.push(bal);
      } else if (isValidatorAsset(asset)) {
        if (asset.method === 'sonic-contract') {
          const value = callResult.value as bigint[];
          allBalances.push({
            address: asset.id,
            balances: {
              ['validators']: new BigNumber(value[0]?.toString() || '0'),
            },
          });
        } else {
          const value = callResult.value as TreasuryApiResult[];
          allBalances.push({
            address: asset.id,
            balances: {
              ['validators']: value[0]?.balance || BIG_ZERO,
            },
          });
        }
      } else if (isConcLiquidityAsset(asset)) {
        const value = callResult.value as LpBreakdown[];
        allBalances.push({
          address: asset.address.toLowerCase(),
          balances: {
            // TODO check [0] actually exists
            [treasuryAddresses[0]!.toLowerCase()]: new BigNumber(value[0]!.totalSupply || BIG_ZERO).shiftedBy(18),
          },
        });
      } else {
        console.warn('Unknown treasury asset type:', asset);
      }
    } else {
      // console.error('Failed to fetch treasury balance for asset:', asset, callResults[i]);
    }
  });

  return allBalances.reduce((all, cur) => {
    all[cur.address] = cur;
    return all;
  }, {} as ChainTreasuryBalance);
};
