import { normalize, schema } from "normalizr";
import flatten from "../utils/flatten";
import unique from "../utils/unique";

export type LocalSchema = Record<string, schema.Entity>;
export type Normalized<K extends any> = Record<
  string,
  {
    ids: string[] | number[];
    entities: Record<string, K>;
  }
  >;

const mergeAllEntries = (data: Normalized<any>[]) => {
  let out : Normalized<any> = {};
  for (let row of data) {
    for (let key in row) {
      if (!out[key]) {
        out[key] = row[key];
      } else {
        // @ts-ignore
        out[key].ids = unique([
          ...out[key].ids,
          ...row[key].ids,
        ]);

        out[key].entities = {
          ...out[key].entities,
          ...row[key].entities,
        }
      }
    }
  }

  return out;
};

class NormalizationProcess {
  private schema: LocalSchema;
  private idMapping: Record<string, string>;

  constructor(config: {
    schema: LocalSchema,
    idMapping: Record<string, string>
  }) {
    this.schema = config.schema;
    this.idMapping = config.idMapping;
  }

  findSchema(name: string) {
    return this.schema[name] || null;
  }

  safeGetSchema(name: string) {
    const schema = this.findSchema(name);
    if (!schema) {
      throw new Error(
        "Cannot normalize : entity name " + name + " doesn't exist."
      );
    }
    return schema;
  }

  private recursiveMapData(dataMapping: any, data: any) {
    let nextData = [];
    for (let key in dataMapping) {
      if (!data[key]) {
        throw new Error("could not find " + key + " in data object");
      }

      if (typeof dataMapping[key] === "string" || Array.isArray(dataMapping[key])) {
        nextData.push(this.normalize(
          dataMapping[key],
          data[key],
        ));
      } else {
        nextData.push(this.recursiveMapData(dataMapping[key], data[key]));
      }
    }

    return flatten(nextData);
  }

  normalize<T extends any>(schemaName: string, data: any): Normalized<T> {

    const schema = this.safeGetSchema(schemaName);
    const normalized = normalize(data, Array.isArray(data) ? [schema] : schema);

    const out = {};
    for (let key in normalized.entities) {
      const idKey = this.idMapping[key] || "id";

      const entities = normalized.entities[key];
      let ids = Object.keys(entities).map(k => entities[k][idKey]);
      out[key] = {
        ids,
        entities
      };
    }

    return out;
  }

  deepNormalize<T extends any>(
    dataMapping: any,
    data: any
  ): Normalized<T> {
    let nextData = this.recursiveMapData(dataMapping, data);
    return mergeAllEntries(nextData);
  }
}

export default NormalizationProcess;
