import SubscribeableCacheInterface, {
  CacheListener
} from "./SubscribeableCacheInterface";

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

class RAMCache implements SubscribeableCacheInterface {
  private cache: Record<string, CacheEntry> = {};
  private config: Config;
  private subscriptions: Record<string, CacheListener[]>;

  constructor(config?: Config) {
    this.config = config || {};
    this.subscriptions = {};
  }

  set(name: string, value: any, config?: Config): Promise<void> {
    const ttl = (config && config.ttl) || this.config.ttl || 0;
    this.cache[name] = {
      config: {
        ttl,
        createdAt: new Date()
      },
      value
    };

    this.notifyForKeys([name]);
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

  merge(data: Record<string, any>, config?: Config) {
    const ttl = (config && config.ttl) || this.config.ttl || 0;

    const toAppend = {};
    Object.keys(data).forEach(key => {
      toAppend[key] = {
        config: {
          ttl,
          createdAt: new Date()
        },
        value: data[key]
      };
    });

    this.cache = {
      ...this.cache,
      ...toAppend
    };

    this.notifyForKeys(Object.keys(data));
  }

  all<T extends any>(): Promise<Record<string, T>> {
    const out = {};
    Object.keys(this.cache).forEach(key => {
      out[key] = this.cache[key].value;
    });

    return Promise.resolve(out) as any;
  }

  subscribe(keys: string[] | string, listener: CacheListener): Function {
    // Our subscription map contains an array for every key that are listenned to
    // Therefore we will register the listener for each key
    const keysArray = Array.isArray(keys) ? keys : [keys];
    keysArray.forEach(key => {
      if (!this.subscriptions[key]) {
        this.subscriptions[key] = [];
      }

      this.subscriptions[key].push(listener);
    });

    // Unsubscribing to all keys we are listening to
    return () => {
      keysArray.forEach(key => {
        this.subscriptions[key] = this.subscriptions[key].filter(
          s => s !== listener
        );
      });
    };
  }

  private notifyForKeys(keys: string[]) {
    // Index listeners by their
    const listenerMap = {};
    keys.forEach(key => {
      if (!this.subscriptions[key]) return;

      this.subscriptions[key].forEach(listener => {
        const listenerStr = listener.toString();
        if (!listenerMap[listenerStr]) {
          listenerMap[listenerStr] = listener;
        } else {
          if (listenerMap[listenerStr] !== listener) {
            console.warn(
              "Two different listeners with the same function body are registered. This doesn't work at the moment. Please give a name to your function."
            );
          }
        }
      });
    });

    Object.keys(listenerMap).forEach(key => listenerMap[key](keys));
  }
}

export default RAMCache;
