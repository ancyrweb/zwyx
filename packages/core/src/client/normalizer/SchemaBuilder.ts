import { schema } from "normalizr";

export type Schema = {
  [key: string]: Record<"id" | string, string | [string]>;
};

class SchemaBuilder {
  private schema = {};
  private idMapping: Record<string, string> = {};
  private entities = {};

  private buildEntity(key: string, entity: any) {
    if (this.schema[key]) return this.schema[key];

    const entityConfig = {};
    const optionsConfig: any = {};
    for (let subKey in entity) {
      if (subKey === "id") {
        optionsConfig.idAttribute = entity[subKey];
        this.idMapping[key] = entity[subKey] as string;
      } else {
        const isEntityArray = Array.isArray(entity[subKey]);
        const schemaName: string = isEntityArray
          ? entity[subKey][0]
          : (entity[subKey] as string);
        if (!this.schema[schemaName]) {
          this.buildEntity(schemaName, this.entities[schemaName] || {});
        }
        entityConfig[subKey] = isEntityArray
          ? [this.schema[schemaName]]
          : this.schema[schemaName];
      }
    }

    this.schema[key] = new schema.Entity(key, entityConfig, optionsConfig);
    return this.schema[key];
  }

  build(entities: Schema) {
    this.entities = entities;
    for (let key in entities) {
      this.buildEntity(key, entities[key]);
    }

    return {
      schema: this.schema,
      idMapping: this.idMapping
    };
  }
  getSchema() {
    return this.schema;
  }
  getMapping() {
    return this.idMapping;
  }
}

export default SchemaBuilder;
