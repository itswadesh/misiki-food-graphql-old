import { Types } from 'mongoose'
import { IResolvers, UserInputError, withFilter } from 'apollo-server-express'
import { Request, SettingsDocument } from '../types'
import { objectId, ifImage } from '../validation'
import { Setting } from '../models'
import { fields, hasSubfields } from '../utils'
import pubsub from '../pubsub'
import {
  closed,
  worldCurrencies,
  sorts,
  timesList,
  orderStatuses,
} from './../config'

const SETTINGS_UPDATED = 'SETTINGS_UPDATED'
const resolvers: IResolvers = {
  Query: {
    shutter: (root, args, { req }: { req: Request }, info) => {
      const start = closed.from.hour * 60 + closed.from.minute
      const end = closed.to.hour * 60 + closed.to.minute
      const date = new Date()
      const now = date.getHours() * 60 + date.getMinutes()
      if (start <= now && now <= end) throw new UserInputError(closed.message)
      else return true
    },
    worldCurrencies: (root, args, { req }: { req: Request }, info) => {
      return worldCurrencies
    },
    orderStatuses: (root, args, { req }: { req: Request }, info) => {
      return orderStatuses.filter((o) => o.public)
    },
    sorts: (root, args, { req }: { req: Request }, info) => {
      return sorts
    },
    timesList: (root, args, { req }: { req: Request }, info) => {
      return timesList
    },
    settings: (root, args, { req }: { req: Request }, info) => {
      return Setting.findOne({}, fields(info)).exec()
    },
    settingsAdmin: (root, args, { req }: { req: Request }, info) => {
      args.uid = req.session.userId
      return Setting.find({}, fields(info)).exec()
    },
  },

  Mutation: {
    saveSettings: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<SettingsDocument> => {
      const { userId } = req.session
      const { id } = args
      let settings = await Setting.findByIdAndUpdate(
        id,
        { $set: { ...args, uid: userId } },
        { new: true }
      ) // If pre hook to be executed for product.save()
      if (!settings)
        throw new UserInputError(`Settings with id= ${id} not found`)

      pubsub.publish(SETTINGS_UPDATED, { settingsUpdated: settings })

      await settings.save() // To fire pre save hoook

      return settings
    },
  },

  Subscription: {
    settingsUpdated: {
      resolve: (
        { settingsUpdated }: { settingsUpdated: SettingsDocument },
        args,
        ctx,
        info
      ) => {
        return settingsUpdated
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator(SETTINGS_UPDATED),
        async (__, _, { req }: { req: Request }) => {
          return true
        }
      ),
    },
  },
}

export default resolvers
