import SubscribeableCacheInterface from "./SubscribeableCacheInterface";
import { Request } from "../types";
import {
  Normalized,
  NormalizedPathIDs
} from "../normalizer/NormalizationProcess";

type StoreConfig = {
  request: Request;
  response: any;
  normalized: Normalized<any>;
};

const deepSet = (obj: object, path: string | string[], val: any) => {
  if (typeof path === "string") path = path.split(".");

  if (path.length === 0) return val;

  const next = path.shift();
  obj[next] = deepSet(obj[next] || {}, path, val);
  return obj;
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
  store(config: StoreConfig) {
    const normalized = config.normalized;
    const request = config.request.request;

    let toMerge = {};
    for (let entityName in normalized.entities) {
      for (let id in normalized.entities[entityName]) {
        toMerge[entityName + ":" + id] = normalized.entities[entityName][id];
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

      const serializedName = JSON.stringify({
        url: request.url,
        method: request.method,
        headers: request.headers
      });

      toMerge[serializedName] = toMergeUnderRequestName;
    }

    this.cache.merge(toMerge);
  }
}

export default CacheManager;
