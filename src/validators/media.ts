import Joi from './joi'

export const createMedia = Joi.object().keys({
  originalFilename: Joi.allow('').label('Chat ID'),
  src: Joi.allow('').label('Source'),
  path: Joi.allow('').label('Path'),
  size: Joi.allow('').label('Size'),
  type: Joi.allow('').label('Type'),
  name: Joi.allow('').label('Name'),
  use: Joi.allow('').label('user'),
  active: Joi.allow('').label('Active/Inactive')
})
