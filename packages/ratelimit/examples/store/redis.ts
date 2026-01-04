import type { RatelimitStore } from "../../src";

// mock Redis client
const redis = {
  incr: async (key: string) => {
    return 1;
  },
  expire: async (key: string, ttl: number) => {},
};

export class RedisStore implements RatelimitStore {
  async increment(key: string) {
    const total = await redis.incr(key);
    const resetTime = Date.now() + 60000;
    return { total, resetTime };
  }
}
