import { normalize, schema } from "normalizr";
import SchemaBuilder, { Schema } from "./SchemaBuilder";

export type LocalSchema = Record<string, schema.Entity>;
type NestedRoute = Record<string, string | RouteObject>;
interface RouteObject {
  [x: string]: string | NestedRoute;
}

export type Route = string | NestedRoute;
export type NormalizerConfig = {
  entities?: Schema;
  routes?: Record<string, Route>;
};

export type Normalized<K extends any> = Record<
  string,
  {
    ids: string[] | number[];
    entities: Record<string, K>;
  }
>;

const flatten = (arr: any[]) => {
  let next = [];
  for (let val of arr) {
    if (Array.isArray(val)) {
      for (let innerVal of val) {
        next.push(innerVal);
      }
    } else {
      next.push(val);
    }
  }

  return next;
};

const mergeAllEntries = data => {
  let out = {};
  for (let row of data) {
    for (let key in row) {
      if (!out[key]) {
        out[key] = row[key];
      } else {
        // TODO : deep merge, eventually check conflicts ?
      }
    }
  }
  return out;
};

class Normalizer {
  private schema: LocalSchema;
  private idMapping: Record<string, string>;
  private routes: Record<string, Route> = {};
  private routesRegexes = {};

  constructor(config?: NormalizerConfig) {
    const entities = config && config.entities ? config.entities : {};
    this.routes = config && config.routes ? config.routes : {};
    Object.keys(this.routes).forEach(key => {
      const pattern =
        key.replace(/:(\w)+/g, "([^/]+)") + "((\\?)([^=]+)(=(.+))?)?$";
      this.routesRegexes[key] = new RegExp(pattern);
    });

    const schemaBuilder = new SchemaBuilder();
    schemaBuilder.build(entities);
    this.schema = schemaBuilder.getSchema();
    this.idMapping = schemaBuilder.getMapping();
  }

  findSchema(name: string) {
    return this.schema[name] || null;
  }

  findRoute(name: string) {
    if (this.routes[name]) return this.routes[name];

    for (let regexKey in this.routesRegexes) {
      const regex = this.routesRegexes[regexKey];
      if (regex.test(name)) {
        return this.routes[regexKey];
      }
    }

    return null;
  }

  private deepNormalize<T extends any>(
    dataMapping: any,
    data: any
  ): Normalized<T> {
    let nextData = this.recursiveMapData(dataMapping, data);
    return mergeAllEntries(nextData);
  }

  private recursiveMapData(dataMapping: any, data: any) {
    let nextData = [];
    for (let key in dataMapping) {
      if (!data[key]) {
        throw new Error("could not find " + key + " in data object");
      }

      if (typeof dataMapping[key] === "string") {
        nextData.push(this.normalize(dataMapping[key], data[key]));
      } else {
        nextData.push(this.recursiveMapData(dataMapping[key], data[key]));
      }
    }

    return flatten(nextData);
  }

  private doNormalize<T extends any>(data: any, schema: any): Normalized<T> {
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

  safeGetSchema(name: string) {
    const schema = this.findSchema(name);
    if (!schema) {
      throw new Error(
        "Cannot normalize : entity name " + name + " doesn't exist."
      );
    }
    return schema;
  }

  normalize<T extends any>(
    entity: string,
    data: object | object[]
  ): Normalized<T> {
    const route = this.findRoute(entity);
    if (route && typeof route === "object") {
      return this.deepNormalize(route, data);
    }

    return this.doNormalize(
      data,
      this.safeGetSchema(route ? (route as string) : entity)
    );
  }
}

export default Normalizer;
