import {
  Injectable,
  PipeTransform,
  UnprocessableEntityException
} from "@nestjs/common";
import { AsyncValidationOptions, ObjectSchema } from "joi";
import { DefaultValidationOptions } from "../options";

@Injectable()
export class JoiSchemaValidationPipe<T, R>
  implements PipeTransform<T, Promise<R>>
{
  constructor(
    private schema: ObjectSchema<R>,
    private requiredFields?: { [K in keyof T]?: true } & Record<string, true>,
    private options: AsyncValidationOptions = new DefaultValidationOptions()
  ) {}

  async transform(value: T): Promise<R> {
    if (this.requiredFields !== undefined) {
      this.schema = this.schema.fork(
        Object.keys(this.requiredFields),
        (field) => field.required()
      );
    }

    try {
      return await this.schema.validateAsync(value, this.options);
    } catch (e) {
      throw new UnprocessableEntityException(e.details);
    }
  }
}
