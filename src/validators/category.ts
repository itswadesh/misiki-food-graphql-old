import Joi from './joi'

export const createCategory = Joi.object().keys({
  chatId: Joi.objectId()
    .required()
    .label('Chat ID'),
  body: Joi.string()
    .required()
    .max(4_000)
    .label('Body')
})
