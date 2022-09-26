import { AnySchema } from "joi";

export interface JoiSchemaProvider {
  get schema(): AnySchema;
}
