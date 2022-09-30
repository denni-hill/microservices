const Joi = require("joi");

const sha256Schema = Joi.string()
  .trim()
  .regex(/^[a-f0-9]{64}$/i);

module.exports = sha256Schema;
