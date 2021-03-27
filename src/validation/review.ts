import { Joi } from './joi'

export const reviewSchema = Joi.object().keys({
  chatId: Joi.objectId()
    .required()
    .label('Chat ID'),
  body: Joi.string()
    .required()
    .label('Body')
})
