import SubscribeableCacheInterface from "./SubscribeableCacheInterface";
import { HTTPRequest, Request } from "../types";
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
    const ids =
      path.isArray === false &&
      Array.isArray(path.values) &&
      path.values.length === 1
        ? path.values[0]
        : path.values;

    const schema = path.schema;

    deepSet(obj, key, {
      ids,
      schema
    });
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
  store(config: StoreConfig): void {
    const normalized = config.normalized;
    const request = config.request.request;

    let toCache = {};

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
        if (normalized.pathIds.$root.isArray === false) {
          if (ids.length > 1) {
            console.warn(
              "The entity is configured as a single-entity route, but received multiple entities. Only the first will be kept"
            );
          }

          toMergeUnderRequestName = {
            $root: {
              ids: ids.length > 0 ? ids[0] : null,
              schema: normalized.pathIds.$root.schema
            }
          };
        } else {
          toMergeUnderRequestName = {
            $root: {
              ids: ids.slice(),
              schema: normalized.pathIds.$root.schema
            }
          };
        }
      }

      toCache[this.createRequestCacheKey(request)] = toMergeUnderRequestName;
    }

    this.cache.merge(toCache);
  }

  createRequestCacheKey(request: HTTPRequest) {
    return JSON.stringify({
      url: request.url,
      method: request.method || "GET",
      headers: request.headers
    });
  }
}

export default CacheManager;
