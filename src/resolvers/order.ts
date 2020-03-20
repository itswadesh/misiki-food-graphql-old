import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, OrderDocument } from '../types'
import { validate, objectId, orderSchema } from '../validation'
import { Chat, Order } from '../models'
import { fields, hasSubfields, index, indexSub, getStartEndDate } from '../utils'
import { ObjectId } from 'mongodb'

const resolvers: IResolvers = {
  Query: {
    orders: (root, args, { req }: { req: Request }, info) => {
      if (args.vendor) {
        args['items.vendor.id'] = args.vendor
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
              id: '$items.vendor.id',
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
            'items.vendor.id': Types.ObjectId(userId),
            status: 'Waiting for confirmation',
            // createdAt: { $gte: start, $lte: end }
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
      const { userId } = req.session
      let data = await Order.aggregate([
        {
          $match: {
            // createdAt: { $gte: start, $lte: end },
          }
        },
        { $unwind: '$items' },
        { $match: { 'items.vendor.id': Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            amount: { $sum: '$items.price' },
            count: { $sum: 1 },
            createdAt: { $max: '$createdAt' },
          }
        }
      ])
      return data[0]
    },
    pendingOrders: (root, args, { req }: { req: Request }, info) => {
      args.status = 'Waiting for confirmation'
      return index({ model: Order, args, info })
    },
    myCustomers: async (root, args, { req }: { req: Request }, info) => {
      const { start, end } = getStartEndDate(0)
      let { userId } = req.session
      userId = Types.ObjectId(userId)
      args['items.vendor.id'] = userId
      // args.createdAt = { $gte: start, $lte: end }
      // args.uid = userId
      return indexSub({ model: Order, args, info, userId })
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
      await validate(orderSchema, args)
      const { userId } = req.session
      const order = await Order.create(req, { ...args, uid: userId })

      await order.save()

      return order
    }
  }
}

export default resolvers
