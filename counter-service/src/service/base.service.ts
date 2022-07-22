import { build, validate } from "chain-validator-js";
import ValidationError from "../errors/validation.error";

export abstract class BaseService {
  protected async validateId(id: unknown): Promise<void> {
    const validationResult = await validate(id, build().isInt());
    if (validationResult.failed) throw new ValidationError(validationResult);
  }
}
