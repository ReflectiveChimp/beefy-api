import { ChainId } from 'blockchain-addressbook';
import { BigNumber, ethers, utils } from 'ethers';
import BeefyVault from '../../abis/BeefyVault.js';
import { API_BASE_URL } from '../../constants.js';
import vaults_json from '../../data/cmc.json';
import { fetchPrice } from '../../utils/fetchPrice.js';
import { getChainRpcs } from '../rpc/rpcs.js';

const fetchVaultTvl = async ({ vault }) => {
  const provider = new ethers.providers.JsonRpcProvider(getChainRpcs(ChainId.bsc)[0]);
  const vaultContract = new ethers.Contract(vault.contract, BeefyVault, provider);
  const vaultBalance = await vaultContract.balance();

  const price = await fetchPrice({ oracle: vault.oracle, id: vault.oracleId });
  const normalizationFactor = 1000000000;
  const normalizedPrice = BigNumber.from(Math.round(price * normalizationFactor));
  const vaultBalanceInUsd = vaultBalance.mul(normalizedPrice.toString());
  const result = vaultBalanceInUsd.div(normalizationFactor);

  const vaultObjTvl = utils.formatEther(result);
  vault.totalStaked = Number(vaultObjTvl).toFixed(2);

  delete vault.apyId;
  delete vault.contract;
  delete vault.oracle;
  delete vault.oracleId;

  return result;
};

export const vaults = async (ctx) => {
  try {
    const apys = await fetch(`${API_BASE_URL}/apy`).then(res.json());

    let promises = [];
    vaults_json.pools.forEach((vault) => {
      vault.apr = apys[vault.apyId].toFixed(6);
      promises.push(fetchVaultTvl({ vault }));
    });
    await Promise.all(promises);
  } catch (err) {
    console.error('CMC error');
  }

  ctx.body = vaults_json;
};
