export type SetCacheConfig = {
  ttl?: number;
};

export type CacheListener = (deltaKeys: string[]) => any;
export type CacheSubscription = Function;

export default interface SubscribeableCacheInterface {
  set(name: string, value: any, config?: SetCacheConfig): Promise<void>;
  get<T extends any>(name: string): Promise<T | null>;
  remove(name: string): Promise<void>;
  clear(): Promise<void>;
  merge<T extends any>(data: Record<string, T>);
  all<T extends any>(): Promise<Record<string, T>>;
  subscribe(keys: string, CacheListener): CacheSubscription;
}
