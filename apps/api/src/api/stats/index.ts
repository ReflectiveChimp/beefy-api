import type { Context } from 'koa';
import { infinityToStringReplacer } from '../../utils/json.js';
import { getApys, getBoostAprs } from './getApys.js';
import { sendInternalServerError } from '../../utils/koa.js';
import { errorToString } from '../../utils/error.js';

/**
 * Infinity is serialized to JSON as null, so we convert it to a string instead
 * (null represents missing apy in the app)
 */
function sendJsonInfinityAsString(ctx: Context, data: Record<string, unknown>) {
  ctx.response.type = 'json';
  ctx.status = 200;
  ctx.body = JSON.stringify(data, infinityToStringReplacer);
}

export async function apy(ctx: Context) {
  try {
    const { apys } = getApys();
    if (Object.keys(apys).length === 0) {
      ctx.status = 503;
      ctx.body = 'There is no APY data yet';
      return;
    }

    sendJsonInfinityAsString(ctx, apys);
  } catch (err) {
    sendInternalServerError(ctx, errorToString(err));
  }
}

export async function apyBreakdowns(ctx: Context) {
  try {
    const { apyBreakdowns } = getApys();
    if (Object.keys(apyBreakdowns).length === 0) {
      ctx.status = 503;
      ctx.body = 'There is no APY Breakdowns data yet';
      return;
    }

    sendJsonInfinityAsString(ctx, apyBreakdowns);
  } catch (err) {
    sendInternalServerError(ctx, errorToString(err));
  }
}

export async function boostApr(ctx: Context) {
  try {
    const boostAprs = getBoostAprs();
    if (Object.keys(boostAprs).length === 0) {
      ctx.status = 503;
      ctx.body = 'There is no boost APR data yet';
      return;
    }

    ctx.status = 200;
    ctx.body = boostAprs;
  } catch (err) {
    sendInternalServerError(ctx, errorToString(err));
  }
}
