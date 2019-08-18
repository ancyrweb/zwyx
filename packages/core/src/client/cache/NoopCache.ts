import SubscribeableCacheInterface, {
  SetCacheConfig
} from "./SubscribeableCacheInterface";

class NoopCache implements SubscribeableCacheInterface {
  set(name: string, value: any, config): void {
    return;
  }

  get<T extends any>(name: string): T | null {
    return null;
  }

  remove(name: string): Promise<void> {
    return;
  }

  clear(): Promise<void> {
    return;
  }

  merge(data: Record<string, any>) {
    return;
  }

  all<T extends any>(): Record<string, T> {
    return null;
  }

  subscribe(keys: string[] | string, CacheListener): Function {
    return () => {};
  }
}

export default NoopCache;
