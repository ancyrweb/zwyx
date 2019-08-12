import { normalize, schema } from "normalizr";
import SchemaBuilder, {Schema} from "./SchemaBuilder";

export type LocalSchema = Record<string, schema.Entity>;
export type Route = string | [string];
export type NormalizerConfig = {
  entities?: Schema,
  routes?: Record<string, Route>,
}

class Normalizer {
  private schema: LocalSchema;
  private idMapping: Record<string, string>;
  private routes : Record<string, Route> = {};
  private routesRegexes = {};

  constructor(config?: NormalizerConfig) {
    const entities = config && config.entities ? config.entities : {};
    this.routes = config && config.routes ? config.routes : {};
    Object.keys(this.routes).forEach(key => {
      const pattern = key.replace(/:(\w)+/g, "([^/]+)") + "((\\?)([^=]+)(=(.+))?)?$";
      this.routesRegexes[key] = new RegExp(pattern);
    });

    const schemaBuilder = new SchemaBuilder();
    schemaBuilder.build(entities);
    this.schema = schemaBuilder.getSchema();
    this.idMapping = schemaBuilder.getMapping();
  }

  findSchema(name: string) {
    const matchingRoute = this.findSchemaMatchingRoute(name);
    if (matchingRoute) {
      return this.schema[Array.isArray(matchingRoute) ? matchingRoute[0] : matchingRoute as string];
    }

    return this.schema[name];
  }

  findSchemaMatchingRoute(name: string) {
    if (this.routes[name])
      return this.routes[name];

    for (let regexKey in this.routesRegexes) {
      const regex = this.routesRegexes[regexKey];
      if (regex.test(name)) {
        return this.routes[regexKey];
      }
    }
    return null;
  }

  normalize(entity: string, data: object|object[]) {
    let schema = this.findSchema(entity);
    if (!schema) {
      throw new Error("Cannot normalize : entity name " + entity + " doesn't exist.");
    }

    const normalized = normalize(data, Array.isArray(data) ? [schema] : schema);
    const out = {};
    for (let key in normalized.entities) {
      const idKey = this.idMapping[key] || "id";
      const entities = normalized.entities[key];
      let ids = Object.keys(entities).map(k => entities[k][idKey]);
      out[key] = {
        ids,
        entities,
      }
    }

    return out;
  }
}

export default Normalizer;
