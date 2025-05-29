import BigNumber from 'bignumber.js';
import { partition } from 'lodash';
import { getAddress } from 'viem';
import BeefyBoostAbi from '../../abis/BeefyBoost.js';
import { isDefined } from '../../utils/array.js';
import { type ApiChain, toChainId } from '../../utils/chain.js';
import { fetchPrice } from '../../utils/fetchPrice.js';
import { isFiniteNumber } from '../../utils/number.js';
import { getAllNewBoosts } from '../boosts/getBoosts.js';
import type { Boost } from '../boosts/types.js';
import { fetchContract } from '../rpc/client.js';
import { type BeefyRewardPoolV2Config, getBeefyRewardPoolV2Aprs } from './common/getBeefyRewardPoolV2Apr.js';
import { getVaultByIdOfType } from './getMultichainVaults.js';
import { errorToString } from '../../utils/error.js';

export const BOOST_APR_EXPIRED = -1;

const updateBoostV2AprsForChain = async (chain: ApiChain, boosts: Boost[]) => {
  try {
    const chainId = toChainId(chain);

    //TODO: check boost update data frequency (/boosts already has periodFinish property) to see if periodFinish is still valid and rpc call can be avoided

    const results = await getBeefyRewardPoolV2Aprs(
      chainId,
      boosts
        .map((boost) => {
          const vault = getVaultByIdOfType(boost.vaultId, 'standard');
          if (!vault) {
            console.warn(
              `updateBoostV2AprsForChain`,
              chain,
              `vault ${boost.vaultId} not found for boost ${boost.id}`,
            );
            return undefined;
          }

          return {
            oracleId: boost.id,
            address: getAddress(boost.contractAddress),
            // bit of a hack for {getTotalStakedInUsd}
            stakedToken: {
              address: vault.earnContractAddress, // mooToken address
              pricePerFullShare: vault.pricePerFullShare, // mooToken -> depositToken ratio
              oracleId: vault.oracleId, // depositToken oracle
              decimals: vault.tokenDecimals || 18, // depositToken decimals
            },
          } satisfies BeefyRewardPoolV2Config;
        })
        .filter(isDefined),
    );

    return results.reduce(
      (aprs: Record<string, number>, result) => {
        if (result && result.totalApr !== undefined && result.rewardsApr && result.rewardsApr.length > 0) {
          aprs[result.oracleId] = result.totalApr;
        }
        return aprs;
      },
      Object.fromEntries(boosts.map((boost) => [boost.id, BOOST_APR_EXPIRED])),
    );
  } catch (err) {
    console.error('updateBoostV2AprsForChain', chain, errorToString(err));
    return {};
  }
};

const updateBoostV1AprsForChain = async (chain: ApiChain, boosts: Boost[]) => {
  const chainId = toChainId(chain);

  //TODO: check boost update data frequency (/boosts already has periodFinish property) to see if periodFinish is still valid and rpc call can be avoided

  const totalSupplyCalls = boosts.map((boost) => {
    const contract = fetchContract(boost.contractAddress, BeefyBoostAbi, chainId);
    return contract.read.totalSupply();
  });
  const rewardRateCalls = boosts.map((boost) => {
    const contract = fetchContract(boost.contractAddress, BeefyBoostAbi, chainId);
    return contract.read.rewardRate();
  });
  const periodFinishCalls = boosts.map((boost) => {
    const contract = fetchContract(boost.contractAddress, BeefyBoostAbi, chainId);
    return contract.read.periodFinish();
  });

  try {
    const [totalSupplies, rewardRates, periodFinishes] = await Promise.all([
      Promise.all(totalSupplyCalls),
      Promise.all(rewardRateCalls),
      Promise.all(periodFinishCalls),
    ]);

    const boostAprs: { [boostId: string]: number } = {};
    for (let i = 0; i < boosts.length; i++) {
      const boost = boosts[i]!;
      const totalSupply = totalSupplies[i];
      const rewardRate = rewardRates[i];
      const periodFinish = periodFinishes[i];
      if (!totalSupply || !rewardRate || !periodFinish) {
        console.error(`Missing data for boost ${boost.id}`);
        continue;
      }

      const apr = await mapResponseToBoostApr(boost, totalSupply, rewardRate, periodFinish);
      if (isFiniteNumber(apr)) {
        boostAprs[boost.id] = apr;
      }
    }

    return boostAprs;
  } catch (err) {
    console.error('updateBoostV1AprsForChain', chain, errorToString(err));
    return {};
  }
};

const updateBoostAprsForChain = async (chain: ApiChain, boosts: Boost[]): Promise<Record<string, number>> => {
  const [boostsV2, boostsV1] = partition(boosts, (boost) => boost.version >= 2);
  const [aprsV2, aprsV1] = await Promise.all([
    updateBoostV2AprsForChain(chain, boostsV2),
    updateBoostV1AprsForChain(chain, boostsV1),
  ]);

  return { ...aprsV1, ...aprsV2 };
};

/**
 * @returns -1 if boost has expired, null if error occurred, apr number value if successful
 */
const mapResponseToBoostApr = async (
  boost: Boost,
  supply: bigint,
  rate: bigint,
  finish: bigint,
): Promise<number|null> => {
  const totalSupply = new BigNumber(supply.toString());
  const rewardRate = new BigNumber(rate.toString());
  const periodFinish = new BigNumber(finish.toString());

  if (periodFinish.times(1000).lte(new BigNumber(Date.now()))) return BOOST_APR_EXPIRED;

  try {
    const vault = getVaultByIdOfType(boost.vaultId, 'standard', true);
    if (!vault) {
      console.error(`[boost aprs] error calculating apr for ${boost.id}: vault ${boost.vaultId} not found`);
      return null;
    }

    if (!vault.pricePerFullShare) {
      console.error(
        `[boost aprs] error calculating apr for ${boost.id}: vault ${boost.vaultId} PPFS not available`,
      );
      return null;
    }

    const reward = boost.rewards[0];
    if (!reward) {
      console.error(`[boost aprs] error calculating apr for ${boost.id}: no rewards found`);
      return null;
    }
    const depositTokenPrice = await fetchPrice({
      oracle: vault.oracle,
      id: vault.oracleId,
    });
    const earnedTokenPrice = await fetchPrice({
      oracle: reward.oracle,
      id: reward.oracleId,
    });

    //Price is missing, we can't consider this as a successful calculation
    if (
      !isFiniteNumber(depositTokenPrice) ||
      depositTokenPrice === 0 ||
      !isFiniteNumber(earnedTokenPrice) ||
      earnedTokenPrice === 0
    ) {
      console.error(
        `[boost aprs] error calculating apr for ${boost.id}: missing price deposit=${depositTokenPrice} earned=${earnedTokenPrice}`,
      );
      return null;
    }

    const amountStakedInUsd = totalSupply
      .times(vault.pricePerFullShare)
      .times(depositTokenPrice)
      .shiftedBy(-(vault.tokenDecimals + 18));
    const yearlyRewardsInUsd = rewardRate
      .times(earnedTokenPrice)
      .times(365 * 24 * 3600)
      .shiftedBy(-reward.decimals);

    return yearlyRewardsInUsd.dividedBy(amountStakedInUsd).toNumber();
  } catch (err) {
    console.error(`[boost aprs] error calculating apr for ${boost.id}: ${errorToString(err)}`);
    return null;
  }
};

export const fetchBoostAprs = async () => {
  const boostByChain = getAllNewBoosts().reduce((allBoosts, previousBoost) => {
    const chainBoosts = (allBoosts[previousBoost.chain] ??= []);
    chainBoosts.push(previousBoost);
    return allBoosts;
  }, {} as { [chain: string]: Boost[] });

  const chainPromises = Object.keys(boostByChain).map((chain) => {
    const chainBoosts = boostByChain[chain];
    if (chainBoosts && chainBoosts.length) {
      return updateBoostAprsForChain(chain as ApiChain, chainBoosts);
    }
  }).filter(isDefined);

  try {
    const results = await Promise.all(chainPromises);
    return results.reduce(
      (allBoostAprs, currentChainBoostChainAprs) => ({
        ...allBoostAprs,
        ...currentChainBoostChainAprs,
      }),
      {},
    );
  } catch (error) {
    console.log(`Failed to update boost aprs: ${errorToString(error)}`);
    return {};
  }
};
