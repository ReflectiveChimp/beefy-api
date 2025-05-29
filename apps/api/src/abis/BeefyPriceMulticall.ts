import type { Abi } from 'abitype';

const BeefyPriceMulticall = [
  {
    inputs: [{ internalType: 'address[][]', name: 'pools', type: 'address[][]' }],
    name: 'getLpInfo',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export default BeefyPriceMulticall;
