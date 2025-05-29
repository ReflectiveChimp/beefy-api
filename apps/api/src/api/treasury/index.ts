import type Koa from 'koa';
import { getAllBeefyHoldings, getBeefyTreasury, getMarketMakerBalances } from './getTreasury.js';

export const getTreasury = (ctx: Koa.Context) => {
  const chainTokens = getBeefyTreasury();
  if (chainTokens) {
    ctx.status = 200;
    ctx.body = chainTokens;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
};

export const getMMBal = (ctx: Koa.Context) => {
  const chainTokens = getMarketMakerBalances();
  if (chainTokens) {
    ctx.status = 200;
    ctx.body = chainTokens;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
};

export const getAllTreasury = (ctx: Koa.Context) => {
  const chainTokens = getAllBeefyHoldings();
  if (chainTokens) {
    ctx.status = 200;
    ctx.body = chainTokens;
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
};
