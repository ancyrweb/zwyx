import CacheInterface from "./CacheInterface";
import {Request} from "../types";
import {Normalized} from "../normalizer/NormalizationProcess";
import {ReconstructionInfo} from "../normalizer/Normalizer";

type StoreConfig = {
  reconstructionInfo: ReconstructionInfo[],
  request: Request,
  response: any,
  normalized: Normalized<any>
}

class CacheManager {
  public cache: CacheInterface;

  constructor(config: { cache: CacheInterface }) {
    this.cache = config.cache;
  }

  store(config: StoreConfig) {
    const data = config.normalized;
    const request = config.request.request;
    const reconstructionInfo = config.reconstructionInfo;

    let toMerge = {};
    for (let entityName in data) {
      for (let id in data[entityName].entities) {
        toMerge[entityName + ":" + id] = data[entityName].entities[id];
      }
    }

    if (request.method === "GET") {
      // We cache the result of the query
      let toMergeUnderRequestName = null;
      const shouldBuildObjectTree = reconstructionInfo.some(x => x.path !== null);
      if (shouldBuildObjectTree) {
        console.log(config.reconstructionInfo, config.response);
        // TODO at this point we need to have a mapping between the deep paths and the IDs to store them
        // requires refactoring Normalizer for deep normalizations
      } else {
        const currentReconstructionInfo = reconstructionInfo[0];
        const ids = data[currentReconstructionInfo.schema].ids;

        if (ids.length > 1) {
          if (currentReconstructionInfo.isArray === false) {
            console.warn("The route " + request.url + " returned an array, but is configured as a single-entity route in your normalizer.");
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
