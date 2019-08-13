import CacheInterface from "./CacheInterface";
import { Normalized } from "../normalizer/Normalizer";

class CacheManager {
  public cache: CacheInterface;

  constructor(config: { cache: CacheInterface }) {
    this.cache = config.cache;
  }

  store(data: Normalized<any>) {
    let toMerge = {};
    for (let entityName in data) {
      for (let id in data[entityName].entities) {
        toMerge[entityName + ":" + id] = data[entityName].entities[id];
      }
    }

    this.cache.merge(toMerge);
  }
}

export default CacheManager;
