import {
  Injectable,
  PipeTransform,
  UnprocessableEntityException
} from "@nestjs/common";
import { AsyncValidationOptions, ObjectSchema } from "joi";
import logger from "src/winston/logger";
import { DefaultValidationOptions } from "../options";

export interface FieldsMarks<T> {
  required?: { [K in keyof T]?: true } & Record<string, true>;
  forbidden?: { [K in keyof T]?: true } & Record<string, true>;
}

@Injectable()
export class JoiSchemaValidationPipe<T, R>
  implements PipeTransform<T, Promise<R>>
{
  constructor(
    private schema: ObjectSchema<R>,
    private markFields?: FieldsMarks<T>,
    private options: AsyncValidationOptions = new DefaultValidationOptions()
  ) {
    this.applyFieldsMarks();
  }

  async transform(value: T): Promise<R> {
    try {
      return await this.schema.validateAsync(value, this.options);
    } catch (e) {
      throw new UnprocessableEntityException(e.details);
    }
  }

  applyFieldsMarks() {
    if (typeof this.markFields === "object") {
      if (typeof this.markFields.required === "object") {
        const required = Object.keys(this.markFields.required);

        try {
          this.schema = this.schema.fork(required, (field) => field.required());
        } catch (e) {
          logger.error(`Could not fork joi schema to make field required`);
          throw e;
        }
      }

      if (typeof this.markFields.forbidden === "object") {
        const forbidden = Object.keys(this.markFields.forbidden);

        try {
          this.schema = this.schema.fork(forbidden, (field) =>
            field.forbidden()
          );
        } catch (e) {
          logger.error(`Could not fork joi schema to make field forbidden`);
          throw e;
        }
      }
    }
  }
}
