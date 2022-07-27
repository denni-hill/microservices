import { build, validate } from "chain-validator-js";
import ValidationError from "../errors/validation.error";

// initially this class should've been extended by all the services to
// inherit validateId function and other common functionality, but
// it seems like there's an issue with circular imports in services,
// that import another services (import of base and derived class in same file),
// so I decided to make BaseService a static class to access it's functionality,
// and don't create hierarchy, so it wouldn't be broken by ts compiler

class BaseService {
  async validateId(id: unknown): Promise<void> {
    const validationResult = await validate(
      id,
      build().isInt().withMessage("id must be type of integer")
    );
    if (validationResult.failed) throw new ValidationError(validationResult);
  }
}

export default new BaseService();
