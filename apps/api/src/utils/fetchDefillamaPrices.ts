import { toNumber } from './number.js';

export const fetchDefillamaPrices = async (coins: string[]) => {
  if (!coins) return {};
  const ids = coins.map((id) => `coingecko:${id}`).join(',');
  const url = `https://coins.llama.fi/prices/current/${ids}`;
  const prices: Record<string, number> = {};
  try {
    const data = (await fetch(url).then((res) => res.json())) as DefiLlamaResponse;
    Object.entries(data.coins).forEach(([key, coin]) => {
      const id = key.split('coingecko:')[1];
      if (!id) {
        return;
      }
      const price = toNumber(coin.price);
      if (price !== undefined) {
        prices[id] = price;
      }
    });
  } catch (e) {
    console.error('> fetchDefillamaPrices', e);
  }
  return prices;
};

type DefiLlamaResponse = {
  coins: Record<string, {
    price: number;
    symbol: string;
    timestamp: number;
    confidence: number;
  }>
}