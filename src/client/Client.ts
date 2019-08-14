import LinkChain, { Link } from "./link/LinkChain";
import { RawRequest, Request, ResponseInfo } from "./types";
import Context from "./Context";
import CacheManager from "./cache/CacheManager";
import NoopCache from "./cache/NoopCache";
import Normalizer from "./normalizer/Normalizer";
import extractRESTPath from "./utils/extractRESTPath";
import { Normalized } from "./normalizer/NormalizationProcess";

type ClientConfig = {
  links: Link[];
  cache?: CacheManager;
  normalizer?: Normalizer;
};

type Response<T extends any> = {
  raw: T;
  data: object;
  info: ResponseInfo;
};

class Client {
  private linkChain: LinkChain;
  private cacheManager: CacheManager;
  public normalizer?: Normalizer;

  constructor(config: ClientConfig) {
    this.linkChain = new LinkChain(config.links);
    this.cacheManager =
      config.cache ||
      new CacheManager({
        cache: new NoopCache()
      });
    this.normalizer = config.normalizer;
  }

  async emit<T extends any>(data: Request): Promise<Response<T>> {
    if (!data.request.method) {
      data.request.method = "GET";
    }

    const request: RawRequest = {
      ...data,
      context: new Context()
    };

    const result: any = await this.linkChain.emit(request);
    const raw: T = result.data;
    let normalized: Normalized<any> | null = null;

    if (this.normalizer && typeof raw === "object" && raw !== null && Object.keys(raw).length > 0) {
      normalized = this.normalizer.normalize(
        extractRESTPath(data.request.url),
        raw as any
      );

      this.cacheManager.store({
        reconstructionInfo: this.normalizer.getReconstructionInfo(request.request.url),
        response: raw,
        normalized,
        request,
      });
    }

    return {
      info: result.info,
      data: normalized,
      raw
    };
  }

  getCacheManager() {
    return this.cacheManager;
  }

  getCache() {
    return this.cacheManager.cache;
  }
}

export default Client;
