import LinkChain, { Link } from "./link/LinkChain";
import { RawRequest, Request } from "./types";
import Context from "./Context";
import CacheManager from "./cache/CacheManager";
import NoopCache from "./cache/NoopCache";

type ClientConfig = {
  links: Link[];
  cache?: CacheManager;
};

class Client {
  private linkChain: LinkChain;
  private cacheManager: CacheManager;

  constructor(config: ClientConfig) {
    this.linkChain = new LinkChain(config.links);
    this.cacheManager =
      config.cache ||
      new CacheManager({
        cache: new NoopCache()
      });
  }

  async emit(data: Request) {
    if (!data.request.method) {
      data.request.method = "GET";
    }

    const request: RawRequest = {
      ...data,
      context: new Context()
    };

    const result = await this.linkChain.emit(request);
    return result;
  }
}

export default Client;
