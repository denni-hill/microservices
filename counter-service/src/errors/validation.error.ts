import { ValidationResult } from "chain-validator-js/dist/result";
import BaseError from "./base.error";

class ValidationError extends BaseError {
  result: ValidationResult | unknown;

  constructor(result: ValidationResult | unknown) {
    super("Validation Error");
    this.result = result;
  }

  getResponseBody = () => {
    if (this.result instanceof ValidationResult) return this.result.errors;
    else return this.result;
  };
  getStatusCode = () => 400;
}

export default ValidationError;
