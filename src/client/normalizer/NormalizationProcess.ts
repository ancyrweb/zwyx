import { normalize, schema } from "normalizr";
import flatten from "../utils/flatten";
import unique from "../utils/unique";

export type LocalSchema = Record<string, schema.Entity>;
export type NormalizedID = string[] | number[];
export type NormalizedIDEntry = {
  schema: string;
  values: NormalizedID;
  isArray: boolean;
};
export type NormalizedPathIDs = Record<"$root" | string, NormalizedIDEntry>;
export type NormalizedIds = Record<string, NormalizedID>;
export type NormalizedEntry<K extends any> = {
  pathIds: NormalizedPathIDs;
  ids: NormalizedIds;
  entities: Record<string, K>;
};

export type Normalized<K extends any> = NormalizedEntry<K>;

const mergeAllEntries = (data: Normalized<any>[]) => {
  let out: Normalized<any> = {
    ids: {},
    entities: {},
    pathIds: {}
  };

  data.forEach(n => {
    out.pathIds = {
      ...out.pathIds,
      ...n.pathIds
    };

    for (let key in n.ids) {
      if (!out.ids[key]) {
        out.ids[key] = n.ids[key];
      } else {
        out.ids[key] = unique([...out.ids[key], ...n.ids[key]]) as any[];
      }

      out.entities[key] = {
        ...out.entities[key],
        ...n.entities[key]
      };
    }
  });

  return out;
};

class NormalizationProcess {
  private schema: LocalSchema;
  private idMapping: Record<string, string>;

  constructor(config: {
    schema: LocalSchema;
    idMapping: Record<string, string>;
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

  private recursiveMapData(dataMapping: any, data: any, path: string = "") {
    let nextData = [];
    for (let key in dataMapping) {
      if (!data[key]) {
        throw new Error("could not find " + key + " in data object");
      }

      const nextPath = path + (path ? "." : "") + key;
      if (
        typeof dataMapping[key] === "string" ||
        Array.isArray(dataMapping[key])
      ) {
        nextData.push(this.normalize(dataMapping[key], data[key], nextPath));
      } else {
        nextData.push(
          this.recursiveMapData(dataMapping[key], data[key], nextPath)
        );
      }
    }

    return flatten(nextData);
  }

  normalize<T extends any>(
    schemaName: string | [string],
    data: any,
    path?: string
  ): Normalized<T> {
    if (!path) path = "$root";

    const isSchemaArray = Array.isArray(schemaName);
    const canonicalSchemaName = isSchemaArray
      ? schemaName[0]
      : (schemaName as string);
    const schema = this.safeGetSchema(canonicalSchemaName);
    const normalized = normalize(data, Array.isArray(data) ? [schema] : schema);

    const out: Normalized<any> = {
      pathIds: {},
      ids: {},
      entities: {}
    };

    for (let key in normalized.entities) {
      const idKey = this.idMapping[key] || "id";
      const entities = normalized.entities[key];
      const ids = Object.keys(entities).map(k => entities[k][idKey]);
      out.ids[key] = ids;
      out.entities[key] = entities;
      if (canonicalSchemaName === key) {
        out.pathIds[path] = {
          schema: key,
          values: ids,
          isArray: Array.isArray(data)
        };
      }
    }

    return out;
  }

  deepNormalize<T extends any>(dataMapping: any, data: any): Normalized<T> {
    let nextData = this.recursiveMapData(dataMapping, data);
    return mergeAllEntries(nextData);
  }
}

export default NormalizationProcess;
