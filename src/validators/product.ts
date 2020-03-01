import Joi from './joi'

export const createProduct = Joi.object().keys({
  name: Joi.string()
    .required()
    .max(500)
    .label('Dish Name'),
  type: Joi.string()
    .required()
    .max(5)
    .label('Veg/Non-Veg'),
  rate: Joi.number()
    .required()
    .min(30)
    .label('Rate'),
  stock: Joi.number()
    .required()
    .min(1)
    .label('Quantity'),
  img: Joi.allow(''),
  time: Joi.allow('')
})
