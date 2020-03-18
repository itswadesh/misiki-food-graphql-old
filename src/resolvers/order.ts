import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, OrderDocument } from '../types'
import { createOrder, objectId } from '../validation'
import { Chat, Order } from '../models'
import { fields, hasSubfields } from '../utils'
import { index } from '../utils/base'
import { getStartEndDate } from '../utils/dates'

const resolvers: IResolvers = {
  Query: {
    orders: (root, args, { req }: { req: Request }, info) => {
      if (args.vendor) {
        args['vendor.id'] = args.vendor
        delete args.vendor
      }
      if (args.user) args['user._id'] = args.user
      const { start, end } = getStartEndDate(0)
      if (args.today) args.createdAt = { $gte: start, $lte: end }
      return index({ model: Order, args, info })
    },
    todaysChefs: async (root, args, ctx, info): Promise<any> => {
      const { start, end } = getStartEndDate(0)
      let result = await Order.aggregate([
        {
          $match: {
            // status: 'Waiting for confirmation',
            // createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: {
              id: '$vendor.id',
              restaurant: '$vendor.restaurant',
              firstName: '$vendor.firstName',
              lastName: '$vendor.lastName',
              address: '$vendor.address',
              phone: '$vendor.phone'
            },
            count: { $sum: '$amount.qty' },
            amount: { $sum: '$amount.subtotal' }
          }
        },
        { $sort: { '_id.address.address': 1 } }
      ])
      return result
    },
    todaysStatus: async (root, args, ctx, info): Promise<any> => {
      const { start, end } = getStartEndDate(0)
      let q: any = {
        // createdAt: { $gte: start, $lte: end },
        // status: "Order Placed"
      }
      let all = await await Order.aggregate([
        { $match: q },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$amount.subtotal' },
            count: { $sum: 1 },
            items: {
              $push: {
                _id: '$_id',
                orderNo: '$orderNo',
                otp: '$delivery.otp',
                item: '$item',
                address: '$address',
                phone: '$phone',
                amount: '$amount',
                vendor: '$vendor',
                createdAt: '$createdAt'
              }
            }
          }
        }
        // { $unwind: '$items' },
        // { $project: { items: 1, address: 1, uid: 1, amount: 1, vendor: 1, createdAt: 1, 'vendor': 1 } },
        // {
        //   $group: {
        //     _id: "$status",
        //     total: { $sum: "$amount.subtotal" },
        //     count: { $sum: 1 },
        //     items: {
        //       $push: {
        //         items: "$items",
        //         address: "$address",
        //         uid: "$uid",
        //         amount: "$amount",
        //         vendor: "$vendor"
        //       }
        //     }
        //   }
        // },
        // { $sort: { "address.address": 1 } }
      ])
      return all[0]
    },
    todaysSummary: async (root, args, { req }: { req: Request }, info) => {
      const { start, end } = getStartEndDate(0)
      const { userId } = req.session
      let result = await Order.aggregate([
        {
          $match: {
            'vendor.id': Types.ObjectId(userId),
            status: 'Waiting for confirmation',
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$item.name',
            count: { $sum: '$amount.qty' },
            amount: { $sum: '$amount.subtotal' }
          }
        }
      ])
      return result[0]
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
    pendingOrders: (root, args, { req }: { req: Request }, info) => {
      args.status = 'Waiting for confirmation'
      return index({ model: Order, args, info })
    },
    myCustomers: (root, args, { req }: { req: Request }, info) => {
      const { start, end } = getStartEndDate(0)
      args['vendor.id'] = req.session.userId
      // args.createdAt = { $gte: start, $lte: end }
      // args.uid = req.session.userId
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
