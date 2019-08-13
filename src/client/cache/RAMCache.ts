import CacheInterface from "./CacheInterface";

type CacheEntry = {
  config: {
    ttl: number;
    createdAt: Date;
  };
  value: any;
};

type Config = {
  ttl?: number;
};
class RAMCache implements CacheInterface {
  private cache: Record<string, CacheEntry> = {};
  private config: Config;

  constructor(config?: Config) {
    this.config = config || {};
  }

  set(name: string, value: any, config): Promise<void> {
    const ttl = (config && config.ttl) || this.config.ttl || 0;
    this.cache[name] = {
      config: {
        ttl,
        createdAt: new Date()
      },
      value
    };
    return Promise.resolve();
  }

  get<T extends any>(name: string): Promise<T | null> {
    if (!this.cache[name]) {
      return Promise.resolve(null);
    }

    const entry = this.cache[name];

    // Check TTL
    if (entry.config.ttl > 0) {
      const delta = Math.floor(
        (Date.now() - entry.config.createdAt.getTime()) / 1000
      );
      if (delta > entry.config.ttl) {
        delete this.cache[name];
        return Promise.resolve(null);
      }
    }

    return Promise.resolve(entry.value);
  }

  remove(name: string): Promise<void> {
    delete this.cache[name];
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.cache = {};
    return Promise.resolve();
  }

  merge(data: Record<string, any>) {
    this.cache = {
      ...this.cache,
      ...data
    };
  }

  all<T extends any>(): Promise<Record<string, T>> {
    return Promise.resolve(this.cache) as any;
  }
}

export default RAMCache;
