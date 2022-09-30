const ValidationError = require("../errors/validation.error");
const Joi = require("joi");

class BaseService {
  validateId(id) {
    const result = Joi.number().integer().min(1).validate(id);
    if (result.error) throw new ValidationError(result.error);
  }
}

module.exports = BaseService;
