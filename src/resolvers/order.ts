import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, OrderDocument } from '../types'
import { createOrder, objectId } from '../validators'
import { Chat, Order } from '../models'
import { fields, hasSubfields } from '../utils'
import { index } from '../utils/base'
import { getStartEndDate } from '../utils/dates'

const resolvers: IResolvers = {
  Query: {
    orders: (root, args, ctx, info): Promise<OrderDocument[]> => {
      return Order.find({}, fields(info)).exec()
    },
    todaysSummary: async (root, args, { req }: { req: Request }, info) => {
      const { start, end } = getStartEndDate(0)
      let result = await Order.aggregate([
        {
          $match: {
            'vendor.phone': req.session.userId,
            status: 'Order Placed',
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$item.name',
            count: { $sum: '$qty' },
            amount: { $sum: '$amount' }
          }
        }
      ])
      return result
    },
    myToday: async (root, args, { req }: { req: Request }, info) => {
      const { start, end } = getStartEndDate(0)
      let data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            vendor: req.session.userId
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ])
      return data[0]
    },
    myCustomers: (root, args, { req }: { req: Request }, info) => {
      const { start, end } = getStartEndDate(0)
      args.vendor = req.session.userId
      args.createdAt = { $gte: start, $lte: end }
      args.uid = req.session.userId
      return index({ model: Order, args, info })
    },
    order: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<OrderDocument | null> => {
      await objectId.validateAsync(args)
      return Order.findById(args.id, fields(info))
    }
  },
  Mutation: {
    checkout: async (
      root,
      args: { address: string; comment: string },
      { req }: { req: Request }
    ): Promise<OrderDocument> => {
      // await checkout.validateAsync(args, { abortEarly: false })
      const { userId } = req.session

      const order = await Order.create(req, { ...args, uid: userId })

      await order.save()

      return order
    },
    create: async (
      root,
      args: { address: string; comment: string },
      { req }: { req: Request }
    ): Promise<OrderDocument> => {
      await createOrder.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      const order = await Order.create(req, { ...args, uid: userId })

      await order.save()

      return order
    }
  }
}

export default resolvers
