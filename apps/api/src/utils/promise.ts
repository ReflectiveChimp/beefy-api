import { chunk } from 'lodash';
import { ABORT_REASON_TIMEOUT } from './http/helpers.js';
import { sleep } from './time.js';

export function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('Promise timed out')), timeout);
    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

export const retryPromiseWithBackOff = async <T>(
  f: (...args: any[]) => Promise<T>,
  args: any[] | undefined,
  label: string,
  nthTry = 1,
  delayTime = 200,
  maxTries = 5,
): Promise<T> => {
  try {
    return args ? await f(...args) : await f();
  } catch (e) {
    if (nthTry > maxTries) {
      return Promise.reject(e);
    }
    console.log(`retrying [${label}]: ${nthTry}/${maxTries}, awaiting ${2 ** (nthTry + 1) * delayTime}`);

    await sleep(2 ** (nthTry + 1) * delayTime);
    return retryPromiseWithBackOff(f, args, label, nthTry + 1, delayTime, maxTries);
  }
};

export function isResultFulfilled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return result.status === 'fulfilled';
}

export function isResultRejected<T>(result: PromiseSettledResult<T>): result is PromiseRejectedResult {
  return result.status === 'rejected';
}

export type PromiseContextFulfilledResult<TContext, TResult> = PromiseFulfilledResult<TResult> & {
  context: TContext;
  elapsed: number;
};
export type PromiseContextRejectedResult<TContext> = PromiseRejectedResult & {
  context: TContext;
  elapsed: number;
};
export type PromiseContextResult<TContext, TResult> =
  | PromiseContextFulfilledResult<TContext, TResult>
  | PromiseContextRejectedResult<TContext>;

export function contextAllSettled<TContext, TResult>(
  contexts: TContext[],
  mapper: (context: TContext) => Promise<TResult>,
): Promise<Array<PromiseContextResult<TContext, TResult>>> {
  return Promise.all(
    contexts.map(async (context) => {
      const start = Date.now();
      try {
        const value = await mapper(context);
        return {
          status: 'fulfilled',
          value,
          context,
          elapsed: Date.now() - start,
        };
      } catch (reason) {
        return {
          status: 'rejected',
          reason,
          context,
          elapsed: Date.now() - start,
        };
      }
    }),
  );
}

export function isContextResultFulfilled<TContext, TResult>(
  result: PromiseContextResult<TContext, TResult>,
): result is PromiseContextFulfilledResult<TContext, TResult> {
  return result.status === 'fulfilled';
}

export function isContextResultRejected<TContext, TResult>(
  result: PromiseContextResult<TContext, TResult>,
): result is PromiseContextRejectedResult<TContext> {
  return result.status === 'rejected';
}

export function getTimeoutAbortSignal(timeout: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(ABORT_REASON_TIMEOUT), timeout);
  return controller.signal;
}

export class AsyncLock {
  private resolveFn: () => void;
  private lockPromise: Promise<void>;

  constructor() {
    this.resolveFn = () => {};
    this.lockPromise = Promise.resolve();
  }

  private async lock() {
    await this.lockPromise;
    this.lockPromise = new Promise((resolve) => (this.resolveFn = resolve));
  }

  private unlock() {
    this.resolveFn();
  }

  async acquire<T>(callback: () => Promise<T>): Promise<T> {
    await this.lock();
    try {
      return await callback();
    } finally {
      this.unlock();
    }
  }

  static acquireAll<T>(locks: AsyncLock[], callback: () => Promise<T>): Promise<T> {
    const head = locks[0];
    if (!head) {
      return callback();
    }
    if (locks.length === 1) {
      return head.acquire(callback);
    }
    return head.acquire(() => AsyncLock.acquireAll(locks.slice(1), callback));
  }
}

type BatchMapParams<T, R> = {
  items: T[];
  batchSize: number;
  handleFn: (batchItems: T[]) => Promise<R[]>;
  retryDelay?: number;
  retryLimit?: number;
  retryLabel: string;
};

export async function batchMapRetry<T, R>({
  items,
  batchSize,
  handleFn,
  retryLabel,
  retryDelay = 200,
  retryLimit = 5,
}: BatchMapParams<T, R>): Promise<PromiseContextResult<T, R>[]> {
  const batches = chunk(items, batchSize);
  const batchResults = await contextAllSettled(batches, async (batchItems) =>
    retryPromiseWithBackOff(handleFn, [batchItems], retryLabel, 1, retryDelay, retryLimit),
  );
  return batchResults.flatMap((results): PromiseContextResult<T, R>[] => {
    if (isContextResultFulfilled(results)) {
      return results.value.map((result, i) => ({
        value: result,
        context: results.context[i]!,
        elapsed: results.elapsed,
        status: results.status,
      }));
    }

    return results.context.map((context, i) => ({
      context: context,
      elapsed: results.elapsed,
      status: results.status,
      reason: results.reason,
    }));
  });
}
