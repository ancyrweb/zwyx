import CacheInterface, {SetCacheConfig} from "./CacheInterface";

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
}

export default NoopCache;
