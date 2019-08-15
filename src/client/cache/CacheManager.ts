import CacheInterface from "./CacheInterface";
import { Request } from "../types";
import {
  Normalized,
  NormalizedPathIDs
} from "../normalizer/NormalizationProcess";
import { ReconstructionInfo } from "../normalizer/Normalizer";

type StoreConfig = {
  reconstructionInfo: ReconstructionInfo[];
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

class CacheManager {
  public cache: CacheInterface;

  constructor(config: { cache: CacheInterface }) {
    this.cache = config.cache;
  }

  store(config: StoreConfig) {
    const normalized = config.normalized;
    const request = config.request.request;
    const reconstructionInfo = config.reconstructionInfo;

    let toMerge = {};
    for (let entityName in normalized.entities) {
      for (let id in normalized.entities[entityName]) {
        toMerge[entityName + ":" + id] = normalized.entities[entityName][id];
      }
    }

    if (request.method === "GET") {
      // We cache the result of the query
      let toMergeUnderRequestName = null;
      const shouldBuildObjectTree = reconstructionInfo.some(
        x => x.path !== null
      );
      if (shouldBuildObjectTree) {
        toMergeUnderRequestName = deflatePathIds(normalized.pathIds);
      } else {
        const currentReconstructionInfo = reconstructionInfo[0];
        const ids = normalized.ids[currentReconstructionInfo.schema];

        if (ids.length > 1) {
          if (currentReconstructionInfo.isArray === false) {
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

      if (toMergeUnderRequestName) {
        const serializedName = JSON.stringify({
          url: request.url,
          method: request.method,
          headers: request.headers
        });

        toMerge[serializedName] = toMergeUnderRequestName;
      }
    }

    this.cache.merge(toMerge);
  }
}

export default CacheManager;
