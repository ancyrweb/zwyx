import SchemaBuilder, { Schema } from "./SchemaBuilder";
import NormalizationProcess, {LocalSchema, Normalized} from "./NormalizationProcess";
import flatten from "../utils/flatten";

type NestedRoute = Record<string, string | [string] | RouteObject>;
interface RouteObject {
  [x: string]: string | [string] | NestedRoute;
}
export type Route = string | [string] | NestedRoute;
export type NormalizerConfig = {
  entities?: Schema;
  routes?: Record<string, Route>;
};

export type ReconstructionInfo = {
  schema: string
  isArray: boolean
  path: string | null,
}

const recursivelyBuildReconstructionPath = (obj: any, path: string = "") : ReconstructionInfo[] => {
  const isArray = Array.isArray(obj);
  if (typeof obj === "string" || Array.isArray(obj)) {
    return [{
      path,
      schema: isArray ? obj[0] : obj,
      isArray: isArray,
    }];
  }

  let out = [];
  for (let key in obj) {
    out.push(recursivelyBuildReconstructionPath(obj[key], path + (path === "" ? "" : ".") + key))
  }

  return flatten(out);
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

  normalize<T extends any>(
    entity: string,
    data: object | object[]
  ): Normalized<T> {
    const normalizationProcess = new NormalizationProcess({
      schema: this.schema,
      idMapping: this.idMapping,
    });

    const route = this.findRoute(entity);
    if (route && typeof route === "object" && Array.isArray(route) === false) {
      return normalizationProcess.deepNormalize(route, data);
    }

    return normalizationProcess.normalize(
      route ? (route as string) : entity,
      data,
    );
  }

  getReconstructionInfo(routeName: string) : ReconstructionInfo[] {
    const route = this.findRoute(routeName);
    if (!route)
      return null;

    const isArray = Array.isArray(route);
    if (typeof route === "string" || isArray) {
      return [{
        path: null,
        schema: isArray ? route[0] as string : route as string,
        isArray,
      }]
    }

    return recursivelyBuildReconstructionPath(route);
  }
}

export default Normalizer;
