import LinkChain, {Link} from "./link/LinkChain";
import {RawRequest, Request} from "./types";
import Context from "./Context";
import CacheInterface from "./cache/CacheInterface";
import NoopCache from "./cache/NoopCache";

type ClientConfig = {
  links: Link[]
  cache?: CacheInterface,
}

const cacheableMethods = ["GET", "OPTIONS", "HEAD"];

class Client {
  private linkChain: LinkChain;
  private cache: CacheInterface;

  constructor(config: ClientConfig) {
    this.linkChain = new LinkChain(config.links);
    this.cache = config.cache || new NoopCache();
  }

  async emit(data: Request) {
    if (!data.request.method) {
      data.request.method = "GET";
    }
    
    const cacheKey = JSON.stringify(data);
    const shouldCache = cacheableMethods.indexOf(data.request.method) >= 0;
    if (shouldCache) {
      const entry = await this.cache.get(cacheKey);
      if (entry)
        return entry;
    }

    const request : RawRequest = {
      ...data,
      context: new Context(),
    };

    const result = await this.linkChain.emit(request);
    if (shouldCache) {
      await this.cache.set(cacheKey, result);
    }
    return result;
  }
}

export default Client;
