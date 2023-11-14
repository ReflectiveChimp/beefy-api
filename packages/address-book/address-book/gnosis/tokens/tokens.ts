import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const xDAI = {
  name: 'Wrapped xDAI',
  address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
  symbol: 'WXDAI',
  oracleId: 'XDAI',
  decimals: 18,
  chainId: 100,
  website: 'https://www.gnosis.io/',
  description:
    'xDai is the native currency built on the Gnosis blockchain, it is generated when a Dai is sent to the xDai bridge, the bridge validators mint the xDai as part of the Gnosis reward native contract.',
  bridge: 'gnosis-canonical',
  logoURI: '',
  documentation: 'https://docs.gnosischain.com/about/tokens/xdai',
} as const;

const _tokens = {
  xDAI,
  WXDAI: xDAI,
  WNATIVE: xDAI,
  AURA: {
    name: 'Aura',
    symbol: 'AURA',
    address: '0x1509706a6c66CA549ff0cB464de88231DDBe213B',
    chainId: 100,
    decimals: 18,
    website: 'https://aura.finance/',
    description:
      'Aura Finance is a protocol built on top of the Balancer system to provide maximum incentives to Balancer liquidity providers and BAL stakers (into veBAL) through social aggregation of BAL deposits and Aura’s native token. For BAL stakers, Aura provides a seamless onboarding process to veBAL, by creating a tokenised wrapper token called auraBAL that represents the 80/20 BPT locked up for the maximum time in VotingEscrow (read more about what this means). This can be staked to receive existing rewards (BAL and bbaUSD) from Balancer, in addition to a share of any BAL earned by Aura (read more about the fees), and additional AURA. This minting process is irreversible however users can trade their auraBAL back to BAL through an incentivised liquidity pool.',
    bridge: 'layer-zero',
    logoURI: '',
    documentation: 'https://docs.aura.finance/',
  },
  wstETH: {
    name: 'Lido Wrapped Staked ETH',
    symbol: 'wstETH',
    address: '0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6',
    chainId: 100,
    decimals: 18,
    website: 'https://lido.fi/',
    description:
      'Lido is a liquid staking solution for ETH backed by industry-leading staking providers. Lido lets users stake their ETH - without locking assets or maintaining infrastructure - whilst participating in on-chain activities, e.g. lending. Lido attempts to solve the problems associated with initial ETH staking - illiquidity, immovability and accessibility - making staked ETH liquid and allowing for participation with any amount of ETH to improve security of the Ethereum network.',
    bridge: 'gnosis-canonical',
    logoURI: '',
    documentation: 'https://docs.lido.fi/',
  },
  BAL: {
    name: 'Balancer',
    symbol: 'BAL',
    address: '0x7eF541E2a22058048904fE5744f9c7E4C57AF717',
    chainId: 100,
    decimals: 18,
    website: 'https://balancer.fi/',
    description:
      'Balancer turns the concept of an index fund on its head: instead of a paying fees to portfolio managers to rebalance your portfolio, you collect fees from traders, who rebalance your portfolio by following arbitrage opportunities. ',
    logoURI: '',
    documentation: 'https://docs.balancer.fi/',
    bridge: 'gnosis-canonical',
  },
  WETH: {
    name: 'Wrapped Ether',
    address: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
    symbol: 'WETH',
    decimals: 18,
    chainId: 100,
    website: 'https://weth.io/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
    bridge: 'gnosis-canonical',
    logoURI: 'https://arbiscan.io/token/images/weth_28.png',
    documentation: 'https://ethereum.org/en/developers/docs/',
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    address: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
    chainId: 100,
    decimals: 6,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    bridge: 'gnosis-canonical',
    logoURI: 'https://hecoinfo.com/token/images/USDTHECO_32.png',
  },
  USDC: {
    name: 'USD Coin',
    address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
    symbol: 'USDC',
    decimals: 6,
    website: 'https://www.centre.io/',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    chainId: 100,
    logoURI: 'https://ftmscan.com/token/images/USDC_32.png',
    documentation: 'https://www.circle.com/en/usdc-multichain/arbitrum',
    bridge: 'gnosis-canonical',
  },
  EURe: {
    name: 'Monerium EURe emoney',
    symbol: 'EURe',
    address: '0x18ec0A6E18E5bc3784fDd3a3634b31245ab704F6',
    chainId: 100,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/23354/small/eur.png?1643926562',
    website: 'https://monerium.com/',
    bridge: 'gnosis-canonical',
    documentation: 'https://monerium.dev/',
    description:
      'EURe is a Euro stable-coin from Monerium. Monerium is the first company authorized to issue money on blockchains under European financial regulation. They have issued EUR, USD, GBP, and ISK as e-money tokens on Ethereum and EUR on Algorand. Monerium also operates a gateway for instant transfers of EUR between bank accounts and blockchain wallets/smart contracts.',
  },
  sDAI: {
    name: 'Savings xDAI',
    symbol: 'sDAI',
    address: '0xaf204776c7245bF4147c2612BF6e5972Ee483701',
    chainId: 100,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/23354/small/eur.png?1643926562',
    website: 'https://spark.fi/',
    documentation: 'https://docs.spark.fi/',
    bridge: 'gnosis-canonical',
    description:
      'Savings Dai (sDAI) is an ERC-4626 representation/wrapper of DAI in the Dai Savings Rate (DSR) module. sDAI allows users to deposit DAI to receive the yield generated by the Maker protocol while still being able to transfer, stake, lend and use it in any way you want.',
  },
  GNO: {
    chainId: 100,
    address: '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb',
    decimals: 18,
    name: 'Gnosis Token',
    symbol: 'GNO',
    website: 'https://www.gnosis.io/',
    documentation: 'https://www.gnosis.io/developers',
    bridge: 'gnosis-canonical',
    description:
      'Gnosis is a community-run chain that is created by nodes run by thousands of ordinary people around the globe. As a distributed network, a diverse set of nodes ensure that the network is resilient to technical failures. A diversity of nodes run across many countries ensures the network can remain credibly neutral infrastructure.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xBAA66822055AD37EC05638eC5AAfDC6Ef0e96445/logo.png',
  },
  COW: {
    chainId: 100,
    address: '0x177127622c4A00F3d409B75571e12cB3c8973d3c',
    decimals: 18,
    name: 'CoW Protocol',
    symbol: 'COW',
    website: 'https://cow.fi/',
    documentation: 'https://docs.cow.fi/',
    bridge: 'gnosis-canonical',
    description:
      'CoW Protocol finds the lowest price for your trade across all exchanges and aggregators, such as Uniswap and 1inch – and protects you from MEV, unlike the others.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xBAA66822055AD37EC05638eC5AAfDC6Ef0e96445/logo.png',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
