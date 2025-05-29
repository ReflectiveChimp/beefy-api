import type { ApiChain } from '../../utils/chain.js';

export interface PointsStructure {
  id: string;
  docs: string;
  points: {
    id: string;
    name: string;
  }[];
  eligibility?: {
    type: string;
    platform?: string;
    tokens?: string[];
    chain?: ApiChain;
  };
  accounting: {
    id: string;
    role: string;
    url?: string;
  }[];
}
