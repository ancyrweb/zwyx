export type SetCacheConfig = {
  ttl?: number;
};
export default interface CacheInterface {
  set(name: string, value: any, config?: SetCacheConfig): Promise<void>;
  get<T extends any>(name: string): Promise<T | null>;
  remove(name: string): Promise<void>;
  clear(): Promise<void>;
  merge<T extends any>(data: Record<string, T>);
  all<T extends any>(): Promise<Record<string, T>>;
}
