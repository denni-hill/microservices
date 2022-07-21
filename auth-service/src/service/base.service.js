const { validate, build } = require("chain-validator-js");
const ValidationError = require("../errors/validation.error");

class BaseService {
  async validateId(id) {
    var validationResult = await validate(id, build().isInt());
    if (validationResult.failed) throw new ValidationError(validationResult);
  }
}

module.exports = BaseService;
