import CacheInterface from "./CacheInterface";

class CacheManager {
  private cache: CacheInterface;

  constructor(config: { cache: CacheInterface }) {
    this.cache = config.cache;
  }
}

export default CacheManager;
