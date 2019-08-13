import CacheInterface, { SetCacheConfig } from "./CacheInterface";

class NoopCache implements CacheInterface {
  set(name: string, value: any, config): Promise<void> {
    return Promise.resolve();
  }

  get<T extends any>(name: string): Promise<T | null> {
    return Promise.resolve(null);
  }

  remove(name: string): Promise<void> {
    return Promise.resolve();
  }

  clear(): Promise<void> {
    return Promise.resolve();
  }

  merge(data: Record<string, any>) {
    return Promise.resolve();
  }

  all<T extends any>(): Promise<Record<string, T>> {
    return Promise.resolve(null);
  }
}

export default NoopCache;
