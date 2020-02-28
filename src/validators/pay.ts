import Joi from "./joi";

export const createPay = Joi.object().keys({
  address: Joi.objectId()
    .required()
    .label("User Address"),
});
