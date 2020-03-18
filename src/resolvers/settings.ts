import { Types } from 'mongoose'
import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, SettingsDocument } from '../types'
import {
  sendMessage,
  objectId,
  productValidation,
  ifImage
} from '../validation'
import { Setting } from '../models'
import { fields, hasSubfields } from '../utils'
import pubsub from '../pubsub'

const MESSAGE_SENT = 'MESSAGE_SENT'
const resolvers: IResolvers = {
  Query: {
    settings: (root, args, { req }: { req: Request }, info) => {
      return Setting.findOne({}, fields(info)).exec()
    },
    settingsAdmin: (root, args, { req }: { req: Request }, info) => {
      args.uid = req.session.userId
      return Setting.find({}, fields(info)).exec()
    }
  },

  Mutation: {
    updateSettings: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<SettingsDocument> => {
      const { userId } = req.session
      const { id, name, description, type, price, stock, img, time } = args
      let settings = await Setting.findOneAndUpdate(
        { _id: id },
        { $set: { ...args, uid: userId } }
      ) // If pre hook to be executed for product.save()
      if (!settings)
        throw new UserInputError(`Settings with id= ${id} not found`)

      await settings.save() // To fire pre save hoook

      return settings
    }
  }
}

export default resolvers
