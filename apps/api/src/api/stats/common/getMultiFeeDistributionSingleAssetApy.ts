import BigNumber from 'bignumber.js';

import type { ChainId } from 'blockchain-addressbook';
import type { Token } from 'blockchain-addressbook';
import MultiFeeDistribution from '../../../abis/common/MultiFeeDistribution/MultiFeeDistribution.js';
import { BASE_HPY } from '../../../constants.js';
import { compound } from '../../../utils/compound.js';
import { fetchPrice } from '../../../utils/fetchPrice.js';
import { fetchContract } from '../../rpc/client.js';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees.js';
import type { ApyBreakdownResult } from './getApyBreakdown.js';

const oracle = 'tokens';

const BLOCKS_PER_DAY = 28800;

export interface MultiFeeDistributionSingleAssetApyParams {
  chainId: ChainId;
  multiFeeDistributionAddress: string;
  want: Token;
  output: Token;
  poolName: string;
}

const getMultiFeeDistributionSingleAssetApy = async (params: MultiFeeDistributionSingleAssetApyParams) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params),
    getTotalStakedInUsd(params),
  ]);
  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  return getBreakdown(params.poolName, apr);
};

const getTotalStakedInUsd = async ({
  chainId,
  multiFeeDistributionAddress,
  want,
}: MultiFeeDistributionSingleAssetApyParams) => {
  const tokenContract = fetchContract(multiFeeDistributionAddress, MultiFeeDistribution, chainId);
  const totalStaked = new BigNumber((await tokenContract.read.totalSupply()).toString());
  const tokenPrice = await fetchPrice({ oracle, id: want.oracleId });
  return totalStaked.times(tokenPrice).dividedBy(want.decimals);
};

const getYearlyRewardsInUsd = async ({
  chainId,
  multiFeeDistributionAddress,
  output,
}: MultiFeeDistributionSingleAssetApyParams) => {
  const tokenPrice: number = await fetchPrice({ oracle, id: output.symbol });
  const rewardPool = fetchContract(multiFeeDistributionAddress, MultiFeeDistribution, chainId);
  const [periodFinish, rewardRate, ...rest] = await rewardPool.read.rewardData([
    output.address as `0x${string}`,
  ]);
  const yearlyRewards = new BigNumber(rewardRate.toString()).times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(output.decimals);

  return yearlyRewardsInUsd;
};

const getBreakdown = (poolName: string, apr: BigNumber): ApyBreakdownResult => {
  const result: ApyBreakdownResult = {
    apys: {},
    apyBreakdowns: {},
  };

  const vaultApr = apr.toNumber();
  const beefyPerformanceFee = getTotalPerformanceFeeForVault(poolName);
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;
  const vaultApy = compound(vaultApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  const totalApy = vaultApy;

  result.apys[poolName] = totalApy;
  result.apyBreakdowns[poolName] = {
    vaultApr: vaultApr,
    vaultApy: vaultApy,
    totalApy: totalApy,
    compoundingsPerYear: BASE_HPY,
    beefyPerformanceFee: beefyPerformanceFee,
  };
  return result;
};

export default getMultiFeeDistributionSingleAssetApy;
