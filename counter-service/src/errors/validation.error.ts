import { ValidationResult } from "chain-validator-js/dist/result";

export class ValidationError extends Error {
  result: ValidationResult;

  constructor(result: ValidationResult) {
    super("Validation Error");
    this.result = result;
  }
}
