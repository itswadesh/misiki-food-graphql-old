import { Joi } from './joi'

export const productSchema = Joi.object().keys({
  id: Joi.objectId()
    .allow('')
    .label('Dish ID'),
  name: Joi.string()
    .required()
    .max(500)
    .label('Dish Name'),
  description: Joi.allow('').label('Dish Description'),
  type: Joi.string()
    .required()
    .max(5)
    .label('Veg/Non-Veg'),
  price: Joi.number()
    .required()
    .min(1)
    .label('Price'),
  stock: Joi.number()
    .required()
    .min(0)
    .label('Quantity'),
  img: Joi.allow(''),
  time: Joi.allow(''),
  category: Joi.allow(''),
  city: Joi.string()
    .required()
    .max(500)
    .label('City')
})
