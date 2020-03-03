import Joi from './joi'
import { MinKey } from 'mongodb'

export const productValidation = Joi.object().keys({
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
  rate: Joi.number()
    .required()
    .min(30)
    .label('Rate'),
  stock: Joi.number()
    .required()
    .min(0)
    .label('Quantity'),
  img: Joi.allow(''),
  time: Joi.allow('')
})
