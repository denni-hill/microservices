import { build, validate } from "chain-validator-js";
import ValidationError from "../errors/validation.error";

export async function validateId(id: unknown): Promise<void> {
  const validationResult = await validate(
    id,
    build().isInt().withMessage("id must be type of integer")
  );
  if (validationResult.failed) throw new ValidationError(validationResult);
}
