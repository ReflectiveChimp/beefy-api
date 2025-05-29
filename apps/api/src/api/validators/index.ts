import type Koa from 'koa';
import { errorToString } from '../../utils/error.js';
import { sendInternalServerError, sendServiceUnavailable } from '../../utils/koa.js';
import { getValidatorPerformance } from './validators.js';

export const validatorPerformance = (ctx: Koa.Context) => {
  try {
    const validatorPerformance = getValidatorPerformance();

    if (!validatorPerformance) {
      sendServiceUnavailable(ctx, 'There is no validator performance data yet');
      return;
    }

    ctx.status = 200;
    ctx.body = validatorPerformance;
  } catch (e) {
    sendInternalServerError(ctx, errorToString(e));
  }
};
