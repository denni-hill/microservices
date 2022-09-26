import Joi from "joi";

export const idSchema = Joi.number().integer().min(1);

export const parseIntSchema = Joi.alternatives().conditional(Joi.number(), {
  then: idSchema.required(),
  otherwise: Joi.object({
    id: idSchema.required()
  })
    .required()
    .custom(({ id }) => id)
});
