import type { KitoRequest, KitoResponse } from "kitojs";
import { middleware } from "kitojs";

export interface RatelimitStore {
  increment(key: string): Promise<{ total: number; resetTime: number }>;
  reset?(key: string): Promise<void>;
}

export class MemoryStore implements RatelimitStore {
  private hits = new Map<string, number>();
  private resetTimes = new Map<string, number>();
  private windowMs: number;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<{ total: number; resetTime: number }> {
    const now = Date.now();
    let resetTime = this.resetTimes.get(key);

    if (!resetTime || now > resetTime) {
      resetTime = now + this.windowMs;
      this.resetTimes.set(key, resetTime);
      this.hits.set(key, 0);
    }

    const total = (this.hits.get(key) || 0) + 1;
    this.hits.set(key, total);

    return { total, resetTime };
  }

  async reset(key: string): Promise<void> {
    this.hits.delete(key);
    this.resetTimes.delete(key);
  }
}

export interface RatelimitOptions {
  windowMs?: number;
  max?:
    | number
    | ((req: KitoRequest, res: KitoResponse) => number | Promise<number>);
  message?: string | object | Buffer;
  statusCode?: number;
  headers?: boolean;
  keyGenerator?: (
    req: KitoRequest,
    res: KitoResponse,
  ) => string | Promise<string>;
  skip?: (req: KitoRequest, res: KitoResponse) => boolean | Promise<boolean>;
  store?: RatelimitStore;
  handler?: (ctx: {
    req: KitoRequest;
    res: KitoResponse;
    next: () => void | Promise<void>;
    options: RatelimitOptions;
  }) => void | Promise<void>;
}

export const ratelimit = (options: RatelimitOptions = {}) => {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute
  const max = options.max ?? 5; // 5 requests per window
  const message =
    options.message || "Too many requests, please try again later.";
  const statusCode = options.statusCode || 429;
  const headers = options.headers ?? true;
  const keyGenerator = options.keyGenerator || ((req) => req.ip);
  const skip = options.skip || (() => false);
  const store = options.store || new MemoryStore(windowMs);

  const defaultHandler = async ({
    req,
    res,
  }: {
    req: KitoRequest;
    res: KitoResponse;
  }) => {
    res.status(statusCode);

    if (typeof message === "object" && !Buffer.isBuffer(message)) {
      res.json(message);
    } else {
      res.send(message);
    }
  };

  const handler = options.handler || defaultHandler;

  return middleware(async (ctx, next) => {
    const { req, res } = ctx;

    if (await skip(req, res)) return next();

    const key = await keyGenerator(req, res);
    const { total, resetTime } = await store.increment(key);

    const maxLimit = typeof max === "function" ? await max(req, res) : max;
    const remaining = Math.max(0, maxLimit - total);

    if (headers) {
      res.header("x-ratelimit-limit", maxLimit.toString());
      res.header("x-ratelimit-remaining", remaining.toString());
      res.header("x-ratelimit-reset", Math.ceil(resetTime / 1000).toString());
    }

    if (total > maxLimit) {
      if (headers) {
        res.header(
          "retry-after",
          Math.ceil((resetTime - Date.now()) / 1000).toString(),
        );
      }

      return handler({ req, res, next, options });
    }

    await next();
  });
};
