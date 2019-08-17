import SubscribeableCacheInterface from "./SubscribeableCacheInterface";
import { Request } from "../types";
import {
  Normalized,
  NormalizedPathIDs
} from "../normalizer/NormalizationProcess";
import deepSet from "../utils/deepSet";

export type StoreConfig = {
  request: Request;
  response: any;
  normalized: Normalized<any>;
};

export type StoreResult = {
  requestCacheKey: string | null;
};

const deflatePathIds = (pathIds: NormalizedPathIDs) => {
  let obj = {};
  for (let key in pathIds) {
    const path = pathIds[key];
    deepSet(
      obj,
      key,
      path.isArray === false && path.values.length === 1
        ? path.values[0]
        : path.values
    );
  }
  return obj;
};

/**
 * Higher-level class to manage the cache.
 * It handles the various events that occur and operate directly on the cache.
 */
class CacheManager {
  public cache: SubscribeableCacheInterface;

  constructor(config: { cache: SubscribeableCacheInterface }) {
    this.cache = config.cache;
  }

  /**
   * Store the normalized data into the cache
   * @param config
   */
  store(config: StoreConfig): StoreResult {
    const normalized = config.normalized;
    const request = config.request.request;

    let toCache = {};
    let requestCacheKey = null;

    // We cache all the entities by default
    for (let entityName in normalized.entities) {
      for (let id in normalized.entities[entityName]) {
        toCache[entityName + ":" + id] = normalized.entities[entityName][id];
      }
    }

    // We cache the result of cacheable requests like GET
    if (request.method === "GET") {
      let toMergeUnderRequestName;

      // If we don't have a root path, then we have various paths
      const shouldBuildObjectTree = normalized.pathIds.$root === undefined;

      if (shouldBuildObjectTree) {
        toMergeUnderRequestName = deflatePathIds(normalized.pathIds);
      } else {
        const ids = normalized.ids[normalized.pathIds.$root.schema];

        if (ids.length > 1) {
          if (normalized.pathIds.$root.isArray === false) {
            console.warn(
              "The route " +
                request.url +
                " returned an array, but is configured as a single-entity route in your normalizer."
            );
          }

          toMergeUnderRequestName = ids.slice();
        } else {
          toMergeUnderRequestName = ids[0];
        }
      }

      requestCacheKey = JSON.stringify({
        url: request.url,
        method: request.method,
        headers: request.headers
      });

      toCache[requestCacheKey] = toMergeUnderRequestName;
    }

    this.cache.merge(toCache);
    return {
      requestCacheKey
    };
  }
}

export default CacheManager;
