import BigNumber from 'bignumber.js';
import { addressBook } from 'blockchain-addressbook';
import { chainIdMap } from 'blockchain-addressbook/utils';
import { keyBy } from 'lodash';
import { serviceEventBus } from '../../utils/ServiceEventBus.js';
import { ZERO_ADDRESS } from '../../utils/address.js';
import { keysToObject } from '../../utils/array.js';
import { getKey, setKey } from '../../utils/cache/index.js';
import { type ApiChain, ApiChains } from '../../utils/chain.js';
import { errorToString } from '../../utils/error.js';
import { getAmmPrice } from '../stats/getAmmPrices.js';
import { getSingleChainVaults } from '../stats/getMultichainVaults.js';
import { getTokensForChain, isTokenNative } from '../tokens/tokens.js';
import { getChainLockedAssets, hasChainLockedAssets } from './lockedAssetHelpers.js';
import { extractBalancesFromTreasuryCallResults, mapAssetToCall } from './multicallUtils.js';
import { getChainConcentratedLiquidityAssets, hasChainConcentratedLiquidityAssets } from './nftAssets.js';
import {
  type MMExchangeBalance,
  type MMReport,
  type MarketMakerAPIResult,
  type TreasuryAsset,
  type TreasuryAssetRegistry,
  type TreasuryBalances,
  type TreasuryReport,
  type TreasuryWalletRegistry,
  isValidatorAsset,
  isVaultAsset,
} from './types.js';
import { getChainValidators, hasChainValidator } from './validatorHelpers.js';

const REFRESH_INTERVAL = 6000 * 10;

// treasury addresses that should be queried for balances
let treasuryAddressesByChain: TreasuryWalletRegistry;

// addressbook + vault tokens where balances should be queried
let assetsByChain: TreasuryAssetRegistry = keysToObject(ApiChains, () => ({}));

let tokenBalancesByChain: TreasuryBalances = keysToObject(ApiChains, () => ({}));

let treasurySummary: TreasuryReport = keysToObject(ApiChains, () => ({}));

// market maker
let marketMakerReport: MMReport = {};

function updateTreasuryAddressesByChain() {
  treasuryAddressesByChain = keysToObject(ApiChains, (chain) => {
    const chainAddressbook = addressBook[chain];
    const addresses: Record<string, { address: string; label: string }> = {};
    const treasuryMultisig = chainAddressbook.platforms.beefyfinance.treasuryMultisig;
    const treasury = chainAddressbook.platforms.beefyfinance.treasury;

    if (treasuryMultisig && treasuryMultisig !== ZERO_ADDRESS) {
      addresses[treasuryMultisig.toLowerCase()] = {
        address: treasuryMultisig,
        label: 'treasuryMultisig',
      };
    }

    // Add treasury only if different from multisig
    if (treasury && treasury !== ZERO_ADDRESS && !addresses[treasury.toLowerCase()]) {
      addresses[treasury.toLowerCase()] = {
        address: treasury,
        label: 'treasury',
      };
    }

    return addresses;
  });
}

function updateAssetsByChain() {
  const tokenAssets = getTokenAddressesByChain();
  const vaultAssets = getVaultAddressesByChain();

  assetsByChain = keysToObject(ApiChains, (chain) => {
    return {
      ...(tokenAssets[chain] || {}),
      ...(vaultAssets[chain] || {}),
    };
  });
}

// Load token address
function getTokenAddressesByChain(): TreasuryAssetRegistry {
  return keysToObject(ApiChains, (chain) => {
    const tokens: Record<string, TreasuryAsset> = {};

    for (const [tokenAddress, token] of Object.entries(getTokensForChain(chain))) {
      // WNATIVE/NATIVE: duplicated as WBNB/BNB, WETH/ETH etc
      if (['WNATIVE', 'NATIVE'].includes(token.id)) continue;
      // WCELO/WMETIS: duplicate as same as native
      if (
        [
          '0x471EcE3750Da237f93B8E339c536989b8978a438',
          '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
          '0x0000000000000000000000000000000000000802',
        ].includes(token.address)
      )
        continue;

      tokens[tokenAddress] = {
        name: token.name,
        address: token.address,
        decimals: token.decimals,
        assetType: isTokenNative(token) ? 'native' : 'token',
        oracleId: token.oracleId,
        oracleType: token.oracle,
        symbol: token.symbol,
        ...(token.staked && { staked: true }),
      };
    }

    if (hasChainValidator(chain)) {
      const validators = getChainValidators(chain);
      for (const validator of validators) {
        tokens[validator.id] = validator;
      }
    }

    if (hasChainLockedAssets(chain)) {
      const lockedAssets = getChainLockedAssets(chain);
      for (const lockedAsset of lockedAssets) {
        tokens[lockedAsset.address.toLowerCase()] = lockedAsset;
      }
    }

    if (hasChainConcentratedLiquidityAssets(chain)) {
      getChainConcentratedLiquidityAssets(chain).forEach((asset) => {
        tokens[asset.address.toLowerCase()] = {
          ...asset,
          staked: true,
        };
      });
    }

    return tokens;
  });
}

function getVaultAddressesByChain(): TreasuryAssetRegistry {
  return keysToObject(ApiChains, (chain) => {
    const chainVaults = getSingleChainVaults(chain) || [];
    return keyBy(
      chainVaults.map((vault) => ({
        name: vault.earnedToken,
        oracleId: vault.oracleId,
        oracleType: vault.oracle,
        assetType: 'vault',
        vaultId: vault.id,
        decimals: vault.tokenDecimals,
        pricePerFullShare: vault.pricePerFullShare,
        address: vault.earnContractAddress,
        staked: true,
      })),
      (asset) => asset.address.toLowerCase(),
    );
  });
}

async function updateSingleChainTreasuryBalance(chain: ApiChain) {
  const assetsToCheck = Object.values(assetsByChain[chain] || {});
  const treasuryAddressesForChain = Object.values(treasuryAddressesByChain[chain]);

  const assetCalls = assetsToCheck.map((asset) =>
    Promise.all(mapAssetToCall(asset, treasuryAddressesForChain, chainIdMap[chain])),
  );

  try {
    const callResults = await Promise.allSettled(assetCalls);
    const hasOneFailedCall = callResults.some((res) => res.status === 'rejected');
    const failedCalls = callResults.filter((res) => res.status === 'rejected').length;
    if (hasOneFailedCall) {
      console.log(
        `> treasury update had at least one failed call on ${chain} ${(
          (failedCalls / callResults.length) * 100
        ).toFixed(2)}% error rate`,
      );
    }

    //If we have at least one failed call, we keep the previous cache, if not we purge outdated values
    tokenBalancesByChain[chain] = {
      ...(tokenBalancesByChain[chain] && hasOneFailedCall ? tokenBalancesByChain[chain] : {}),
      ...extractBalancesFromTreasuryCallResults(
        assetsToCheck,
        treasuryAddressesForChain.map((t) => t.address),
        callResults,
      ),
    };
  } catch (err) {
    console.log('error updating treasury balances on chain ' + chain);
    console.log(errorToString(err));
  }
}

async function buildMarketMakerReport() {
  const report: MMReport = {};
  if (process.env.MM_BALANCE_API) {
    const marketMakerBalances: MarketMakerAPIResult = await fetch(process.env.MM_BALANCE_API).then(
      async (res) => (await res.json()) as MarketMakerAPIResult,
    );
    const system9Balances: Record<string, MMExchangeBalance> = {};
    for (const [exchange, balances] of Object.entries(marketMakerBalances)) {
      system9Balances[exchange] = {};
      for (const [token, balance] of Object.entries(balances)) {
        const tokenName = token === 'USD' ? 'USDT' : token;
        const tokenPrice = (await getAmmPrice(tokenName, true)) || 0;
        system9Balances[exchange][tokenName] = {
          symbol: tokenName,
          name: tokenName,
          oracleId: tokenName,
          oracleType: 'tokens',
          price: tokenPrice,
          usdValue: (balance * tokenPrice).toString(),
          balance: balance.toString(),
        };
      }
    }
    report['system9'] = system9Balances;
    marketMakerReport = report;
    console.log('> market maker balances updated');
  }
}

async function updateTreasuryBalances() {
  try {
    console.log('> updating treasury balances');
    const start = Date.now();

    await Promise.allSettled(ApiChains.map(updateSingleChainTreasuryBalance));
    await buildTreasuryReport();
    await buildMarketMakerReport();
    await saveToRedis();
    console.log(`> treasury balances updated (${((Date.now() - start) / 1000).toFixed(2)}s)`);
  } catch (err) {
    console.log(`> error updating treasury`);
    console.log(errorToString(err));
  } finally {
    setTimeout(() => {
      updateTreasuryBalances();
    }, REFRESH_INTERVAL);
  }
}

async function buildTreasuryReport() {
  const chainReports = await Promise.all(
    ApiChains.map(async (chainId) => ({
      chainId,
      report: await buildTreasuryReportForChain(chainId),
    })),
  );

  for (const { chainId, report } of chainReports) {
    treasurySummary[chainId] = report;
  }
}

async function buildTreasuryReportForChain(chain: ApiChain): Promise<TreasuryReport[ApiChain]> {
  const chainBalancesByAddress = tokenBalancesByChain[chain] || {};
  const balanceReport: TreasuryReport[ApiChain] = {};

  const chainTreasuryWallets = treasuryAddressesByChain[chain];
  for (const [address, wallet] of Object.entries(chainTreasuryWallets)) {
    balanceReport[address] = {
      name: wallet.label,
      balances: {},
    };
  }

  for (const assetBalance of Object.values(chainBalancesByAddress)) {
    const treasuryAsset = assetsByChain[chain]?.[assetBalance.address];

    if (treasuryAsset === undefined) {
      continue; // cached asset hasn't been deleted yet
    }

    let price: number | undefined;
    for (const [treasuryWallet, balance] of Object.entries(assetBalance.balances)) {
      try {
        if (balance.gt(0)) {
          if (price === undefined) {
            price = (await getAmmPrice(treasuryAsset.oracleId, true)) || 0;
          }

          // Add validator wallet if missing
          if (!balanceReport[treasuryWallet]) {
            balanceReport[treasuryWallet] = {
              name: treasuryWallet,
              balances: {},
            };
          }
          const usdValue = findUsdValueForBalance(treasuryAsset, price, balance);
          const key = isValidatorAsset(treasuryAsset) ? treasuryAsset.id : treasuryAsset.address;
          balanceReport[treasuryWallet].balances[key] = {
            ...treasuryAsset,
            price,
            usdValue: usdValue.toString(10),
            balance: balance.toString(10),
          };
        }
      } catch (err) {
        console.log(`> error setting treasury balance on ${chain} for asset ${treasuryAsset.name}`);
      }
    }
  }

  return balanceReport;
}

function findUsdValueForBalance(tokenInfo: TreasuryAsset, tokenPrice: number, balance: BigNumber): BigNumber {
  if (isVaultAsset(tokenInfo)) {
    return balance
      .multipliedBy(tokenPrice)
      .multipliedBy(tokenInfo.pricePerFullShare)
      .shiftedBy(-18)
      .shiftedBy(-tokenInfo.decimals);
  } else {
    return balance.multipliedBy(tokenPrice).shiftedBy(-tokenInfo.decimals);
  }
}

async function saveToRedis() {
  await setKey('TREASURY_BALANCES', tokenBalancesByChain);
  await setKey('TREASURY_REPORT', treasurySummary);
  await setKey('MM_REPORT', marketMakerReport);
}

async function restoreFromRedis() {
  const cachedSummary = await getKey<TreasuryReport>('TREASURY_REPORT');
  const cachedBalances = await getKey<TreasuryBalances>('TREASURY_BALANCES');
  const cachedMMReport = await getKey<MMReport>('MM_REPORT');
  if (cachedSummary) {
    treasurySummary = cachedSummary;
  }
  if (cachedBalances) {
    tokenBalancesByChain = cachedBalances;
    //Need balance values as bignumbers, not strings
    Object.values(tokenBalancesByChain).forEach((chainBalances) => {
      Object.values(chainBalances).forEach((walletBalance) => {
        Object.keys(walletBalance.balances).forEach((key) => {
          walletBalance.balances[key] = new BigNumber(walletBalance.balances[key]!);
        });
      });
    });
  }
  if (cachedMMReport) {
    marketMakerReport = cachedMMReport;
  }
}

export async function initTreasuryService() {
  // Load from redis if available
  await restoreFromRedis();

  // Wait until we have tokens and vaults
  await Promise.all([
    serviceEventBus.waitForFirstEvent('tokens/updated'),
    serviceEventBus.waitForFirstEvent('vaults/updated'),
  ]);

  // Fetch treasury addresses, these are inferred from the addressbook so no need to update till api restarts
  updateTreasuryAddressesByChain();

  // Initialize tokens/vault assets
  updateAssetsByChain();

  // Update balances
  await updateTreasuryBalances();

  // Update tokens/vault assets whenever tokens (or vaults) are updated
  serviceEventBus.on('tokens/updated', updateAssetsByChain);
}

export function getBeefyTreasury(): TreasuryReport {
  return treasurySummary;
}

export function getMarketMakerBalances(): MMReport {
  return marketMakerReport;
}

export function getAllBeefyHoldings() {
  return {
    treasury: getBeefyTreasury(),
    marketMaker: getMarketMakerBalances(),
  };
}
