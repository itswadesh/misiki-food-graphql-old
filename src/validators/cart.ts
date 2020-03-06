import Joi from './joi'

export const createCart = Joi.object().keys({
  pid: Joi.objectId()
    .required()
    .label('Product ID'),
  vid: Joi.objectId()
    .allow('')
    .label('Variant'),
  qty: Joi.number()
    .required()
    .label('Qty'),
  replace: Joi.boolean().label('Replace')
})
