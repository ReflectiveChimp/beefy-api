import type { Campaign, MerklCampaign } from './types.js';

export function isMerklCampaign(campaign: Campaign): campaign is MerklCampaign {
  return campaign.providerId === 'merkl';
}
