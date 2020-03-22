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
        { $unwind: '$items' },
        {
          $group: {
            _id: {
              id: '$items.vendor.id',
              restaurant: '$items.vendor.restaurant',
              firstName: '$items.vendor.firstName',
              lastName: '$items.vendor.lastName',
              address: '$items.vendor.address',
              phone: '$items.vendor.phone'
            },
            count: { $sum: '$items.qty' },
            amount: { $sum: '$items.price' }
          }
        },
        { $sort: { '_id.address.address': 1 } }
      ])
      return result
    },
    delivery: async (root, args, ctx, info): Promise<any> => {
      // let q: any = {
      //   // createdAt: { $gte: start, $lte: end },
      //   // status: "Order Placed"
      // }
      const { start, end } = getStartEndDate(0)
      // createdAt: { $gte: start, $lte: end },
      let q: any = { 'items.status': 'Waiting for confirmation' }
      let pending = await Order.aggregate(
        [
          { $match: q },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.status',
              total: { $sum: '$items.price' },
              count: { $sum: 1 },
              items: { $addToSet: { _id: '$_id', name: '$name', address: '$address', phone: '$phone', amount: '$amount', vendor: '$vendor' } }
            }
          }, { $sort: { 'items.vendor.address.address': 1 } }
        ])
      q = { createdAt: { $gte: start, $lte: end }, 'items.status': 'Out For Delivery' }
      let od = await await Order.aggregate(
        [
          { $match: q },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.status',
              total: { $sum: '$items.price' },
              count: { $sum: 1 },
              items: { $addToSet: { _id: '$_id', name: '$name', address: '$address', phone: '$phone', amount: '$amount', vendor: '$vendor' } }
            }
          }, { $sort: { 'items.address.qrno': 1 } }
        ])
      q = { createdAt: { $gte: start, $lte: end }, 'items.status': 'Delivered' }
      let delivered = await Order.aggregate(
        [
          { $match: q },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.status',
              total: { $sum: '$items.price' },
              count: { $sum: 1 },
              items: { $addToSet: { _id: '$_id', name: '$name', address: '$address', phone: '$phone', amount: '$amount', vendor: '$vendor' } }
            }
          }, { $sort: { 'items.address.qrno': 1 } }
        ])
      q = { createdAt: { $gte: start, $lte: end }, 'items.status': 'Cancelled' }
      let cancelled = await Order.aggregate(
        [
          { $match: q },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.status',
              total: { $sum: '$items.price' },
              count: { $sum: 1 },
              items: { $addToSet: { _id: '$_id', name: '$name', address: '$address', phone: '$phone', amount: '$amount', vendor: '$vendor' } }
            }
          }, { $sort: { 'items.address.qrno': 1 } }
        ])
      q = { createdAt: { $gte: start, $lte: end } }
      let all = await await Order.aggregate(
        [
          { $match: q },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.status',
              total: { $sum: '$items.price' },
              count: { $sum: 1 },
              items: { $addToSet: { _id: '$_id', user: '$user', address: '$address', vendor: '$items.vendor', amount: '$amount', items: '$items' } }
            }
          }, { $sort: { 'items.address.qrno': 1 } }
        ])
      return { pending: pending[0] || {}, out: od[0] || {}, delivered: delivered[0] || {}, cancelled: cancelled[0] || {}, all: all[0] || {} }
      // let all = await await Order.aggregate([
      //   { $match: q },
      //   { $unwind: '$items' },
      //   {
      //     $group: {
      //       _id: '$items.status',
      //       amount: { $sum: '$items.price' },
      //       count: { $sum: 1 },
      //       items: { $addToSet: '$items' }
      //     }
      //   }
      //   // { $unwind: '$items' },
      //   // { $project: { items: 1, address: 1, uid: 1, amount: 1, vendor: 1, createdAt: 1, 'vendor': 1 } },
      //   // {
      //   //   $group: {
      //   //     _id: "$status",
      //   //     total: { $sum: "$amount.subtotal" },
      //   //     count: { $sum: 1 },
      //   //     items: {
      //   //       $push: {
      //   //         items: "$items",
      //   //         address: "$address",
      //   //         uid: "$uid",
      //   //         amount: "$amount",
      //   //         vendor: "$vendor"
      //   //       }
      //   //     }
      //   //   }
      //   // },
      //   // { $sort: { "address.address": 1 } }
      // ])
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
        { $unwind: '$items' },
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
    deliveryOrders: (root, args, { req }: { req: Request }, info) => {
      let userId = Types.ObjectId(args.id)
      args['items.status'] = args.status
      return indexSub({ model: Order, args, info, userId })
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
    myOrders: async (root, args, { req }: { req: Request }, info) => {
      const { start, end } = getStartEndDate(0)
      let userId = Types.ObjectId(args.id)
      delete args.id
      args['items.vendor.id'] = userId
      args['items.status'] = 'Prepared'
      // args.createdAt = { $gte: start, $lte: end }
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
    updateOrder: async (
      root,
      args: { id: string; pid: string, status: string },
      { req }: { req: Request }
    ): Promise<OrderDocument | null> => {
      const { userId } = req.session
      return Order.findOneAndUpdate({ _id: args.id, 'items.pid': args.pid },
        { $set: { "items.$.status": args.status } })
    },
    collectPayment: async (
      root,
      args: { id: string; cod_paid: number },
      { req }: { req: Request }
    ): Promise<Boolean> => {
      const { userId } = req.session
      const o = await Order.updateOne({ _id: args.id },
        { $set: { "cod_paid": args.cod_paid } })
      return o.nModified
    },
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
