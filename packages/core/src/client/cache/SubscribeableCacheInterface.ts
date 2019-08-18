export type SetCacheConfig = {
  ttl?: number;
};

export type CacheListener = (deltaKeys: string[]) => any;
export type CacheSubscription = Function;

export default interface SubscribeableCacheInterface {
  set(name: string, value: any, config?: SetCacheConfig): void;
  get<T extends any>(name: string): T | null;
  remove(name: string): void;
  clear(): Promise<void>;
  merge<T extends any>(data: Record<string, T>);
  all<T extends any>(): Record<string, T>;
  subscribe(keys: string[] | string, CacheListener): CacheSubscription;
}
