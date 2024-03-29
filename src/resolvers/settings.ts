import { Types } from 'mongoose'
import { IResolvers, UserInputError, withFilter } from 'apollo-server-express'
import { Request, SettingsDocument } from '../types'
import { objectId, ifImage } from '../validation'
import { Setting, Product, User } from '../models'
import { fields, hasSubfields } from '../utils'
import pubsub from '../pubsub'
import {
  closed,
  worldCurrencies,
  sorts,
  timesList,
  orderStatuses,
  userRoles,
  paymentStatuses,
} from './../config'

const SETTINGS_UPDATED = 'SETTINGS_UPDATED'
const resolvers: IResolvers = {
  Query: {
    shutter: (root: any, args: any, { req }: { req: Request }, info) => {
      const start = closed.from.hour * 60 + closed.from.minute
      const end = closed.to.hour * 60 + closed.to.minute
      const date = new Date()
      const now = date.getHours() * 60 + date.getMinutes()
      if (start <= now && now <= end) return true //throw new UserInputError(closed.message)
      else return true
    },
    worldCurrencies: (root: any, args: any, { req }: { req: Request }, info) => {
      return worldCurrencies
    },
    orderStatuses: async (root: any, args: any, { req }: { req: Request }, info) => {
      const user = req.session.userId
      const role = (await User.findById(user) || {}).role
      if (role == 'admin')
        return orderStatuses
      else if (role == 'chef')
        return orderStatuses.filter((o) => o.chef)
      else if (role == 'delivery')
        return orderStatuses.filter((o) => o.delivery)
      else
        return orderStatuses.filter((o) => o.public)
    },
    paymentStatuses: (root: any, args: any, { req }: { req: Request }) => {
      return paymentStatuses
    },
    sorts: (root: any, args: any, { req }: { req: Request }, info) => {
      return sorts
    },
    timesList: (root: any, args: any, { req }: { req: Request }, info) => {
      return timesList
    },
    userRoles: (root: any, args: any, { req }: { req: Request }, info) => {
      return userRoles
    },
    settings: async (root: any, args: any, { req }: { req: Request }, info) => {
      let s: any = await Setting.findOne({}, fields(info)).exec()
      s.userRoles = userRoles
      s.paymentStatuses = paymentStatuses
      s.orderStatuses = orderStatuses
      s.worldCurrencies = worldCurrencies
      return s
    },
    settingsAdmin: (root: any, args: any, { req }: { req: Request }, info) => {
      // args.user = req.session.userId
      return Setting.find({}, fields(info)).exec()
    },
  },

  Mutation: {
    closeRestaurant: async (
      root: any,
      args: any,
      { req }: { req: Request }
    ): Promise<Boolean> => {
      let q: any = { stock: { $gt: 0 } }
      if (args.city) q.city = args.city
      if (args.time) q.time = args.time
      const p = await Product.updateMany(
        q,
        { $set: { stock: 0 } }
      )
      return p.nModified > 0
    },
    // closeDinner: async (
    //       root:any,
    //       args:any,
    //       { req }: { req: Request }
    //     ): Promise<Boolean> => {
    //   const p = await Product.updateMany(
    //     { city:args.city, type:'Dinner', stock: { $gt: 0 } },
    //     { $set: { stock: 0 } }
    //   )
    //   return p.nModified
    // },
    // closeLunch: async (
    //       root:any,
    //       args:any,
    //       { req }: { req: Request }
    //     ): Promise<Boolean> => {
    //   const p = await Product.updateMany(
    //     { city:args.city, type:'Launch', stock: { $gt: 0 } },
    //     { $set: { stock: 0 } }
    //   )
    //   return p.nModified
    // },
    saveSettings: async (
      root: any,
      args: any,
      { req }: { req: Request }
    ): Promise<SettingsDocument> => {
      const { userId } = req.session
      const { id } = args
      let settings = await Setting.findByIdAndUpdate(
        id,
        { $set: { ...args, user: userId } },
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
        args: any,
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
