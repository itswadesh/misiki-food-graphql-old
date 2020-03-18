import { Joi } from './joi'

export const orderSchema = Joi.object({
  body: Joi.string()
    .required()
    .max(4_000) // TODO: Truncate into multiple msgs
    .label('Body')
})
