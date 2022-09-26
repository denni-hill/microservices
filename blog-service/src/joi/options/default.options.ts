import { AsyncValidationOptions } from "joi";

export class DefaultValidationOptions implements AsyncValidationOptions {
  stripUnknown = {
    arrays: false,
    objects: true
  };

  abortEarly = false;
}
