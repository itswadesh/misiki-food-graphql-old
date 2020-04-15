import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import {
  Request,
  MessageDocument,
  UserDocument,
  OrderDocument,
  PaymentDocument,
} from '../types'
import { validate, objectId, orderSchema } from '../validation'
import { Order, Payment } from '../models'
import {
  fields,
  hasSubfields,
  index,
  indexSub,
  getStartEndDate,
  placeOrder,
  clearCart,
  validateCart,
  validateCoupon,
  calculateSummary,
} from '../utils'
import { ObjectId } from 'mongodb'
import pubsub from '../pubsub'

const ORDER_UPDATED = 'ORDER_UPDATED'

const resolvers: IResolvers = {
  Query: {
    validateCoupon: async (root, args, { req }) => {
      const { cart } = req.session
      const code = req.session.cart.discount && req.session.cart.discount.code
      await calculateSummary(req, code)
      // await validateCoupon(cart, code)
    },
    validateCart: async (root, args, { req }) => {
      await validateCart(req)
    },
    hasOrder: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const order = await Order.findOne({
        'user.id': userId,
        'items.pid': args.product,
      })
      if (!order) return false
      const p = order.items.find((element) => element.pid == args.product)
      return p && !p.reviewed
    },
    orders: (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      args['user.id'] = userId
      return index({ model: Order, args, info })
    },
    allOrders: (root, args, { req }: { req: Request }, info) => {
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
            createdAt: { $gte: start, $lte: end },
          },
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
              phone: '$items.vendor.phone',
            },
            count: { $sum: '$items.qty' },
            amount: { $sum: '$items.price' },
          },
        },
        { $sort: { '_id.address.address': 1 } },
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
      let q: any = {
        createdAt: { $gte: start, $lte: end },
        'items.status': 'Waiting for confirmation',
      }
      let pending = await Order.aggregate([
        { $match: q },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.status',
            total: { $sum: '$items.price' },
            count: { $sum: 1 },
            items: {
              $addToSet: {
                _id: '$_id',
                name: '$name',
                address: '$address',
                phone: '$phone',
                amount: '$amount',
                vendor: '$vendor',
              },
            },
          },
        },
        { $sort: { 'items.vendor.address.address': 1 } },
      ])
      q = {
        createdAt: { $gte: start, $lte: end },
        'items.status': 'Out For Delivery',
      }
      let od = await await Order.aggregate([
        { $match: q },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.status',
            total: { $sum: '$items.price' },
            count: { $sum: 1 },
            items: {
              $addToSet: {
                _id: '$_id',
                name: '$name',
                address: '$address',
                phone: '$phone',
                amount: '$amount',
                vendor: '$vendor',
              },
            },
          },
        },
        { $sort: { 'items.address.qrno': 1 } },
      ])
      q = { createdAt: { $gte: start, $lte: end }, 'items.status': 'Delivered' }
      let delivered = await Order.aggregate([
        { $match: q },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.status',
            total: { $sum: '$items.price' },
            count: { $sum: 1 },
            items: {
              $addToSet: {
                _id: '$_id',
                name: '$name',
                address: '$address',
                phone: '$phone',
                amount: '$amount',
                vendor: '$vendor',
              },
            },
          },
        },
        { $sort: { 'items.address.qrno': 1 } },
      ])
      q = { createdAt: { $gte: start, $lte: end }, 'items.status': 'Cancelled' }
      let cancelled = await Order.aggregate([
        { $match: q },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.status',
            total: { $sum: '$items.price' },
            count: { $sum: 1 },
            items: {
              $addToSet: {
                _id: '$_id',
                address: '$address',
                phone: '$phone',
                amount: '$amount',
                vendor: '$vendor',
              },
            },
          },
        },
        { $sort: { 'items.address.qrno': 1 } },
      ])
      q = { createdAt: { $gte: start, $lte: end } }
      let all = await await Order.aggregate([
        { $match: q },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            total: { $sum: '$items.price' },
            count: { $sum: 1 },
            items: {
              $addToSet: {
                _id: '$_id',
                user: '$user',
                address: '$address',
                items: '$items',
                amount: '$amount',
              },
            },
          },
        },
        { $sort: { 'items.address.qrno': 1 } },
      ])
      return {
        pending: pending[0] || {},
        out: od[0] || {},
        delivered: delivered[0] || {},
        cancelled: cancelled[0] || {},
        all: all[0] || {},
      }
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
    myItemsSummaryByName: async (
      root,
      args,
      { req }: { req: Request },
      info
    ) => {
      const { start, end } = getStartEndDate(0)
      const { userId } = req.session
      let result = await Order.aggregate([
        {
          $match: {
            'items.vendor.id': Types.ObjectId(userId),
            status: args.status,
            // createdAt: { $gte: start, $lte: end }
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            count: { $sum: '$amount.qty' },
            amount: { $sum: '$amount.subtotal' },
            createdAt: { $max: '$createdAt' },
          },
        },
      ])
      return result
    },
    // todayOrderSummary: async (root, args, { req }: { req: Request }, info) => {
    //   const { start, end } = getStartEndDate(0)
    //   let data = await await Order.aggregate(
    //     [
    //       { $match: { createdAt: { $gte: start, $lte: end } } },
    //       { $unwind: '$items' },
    //       {
    //         $group: {
    //           _id: null,
    //           total: { $sum: '$items.price' },
    //           count: { $sum: 1 },
    //           createdAt: { $max: '$createdAt' },
    //         }
    //       }, { $sort: { 'items.address.qrno': 1 } }
    //     ])
    //   return data[0]
    // },
    todaysSummary: async (root, args, { req }: { req: Request }, info) => {
      const { start, end } = getStartEndDate(0)
      const { userId } = req.session
      let data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            amount: { $sum: '$items.price' },
            count: { $sum: 1 },
            createdAt: { $max: '$createdAt' },
          },
        },
      ])
      return data[0]
    },
    paymentsSummary: async (root, args, { req }: { req: Request }, info) => {
      let data = await Order.aggregate([
        {
          $group: {
            _id: null,
            amount: { $sum: '$amount.total' },
            count: { $sum: '$amount.qty' },
            cod_paid: { $sum: '$cod_paid' },
          },
        },
      ])
      return data[0]
    },
    allOrderSummary: async (root, args, { req }: { req: Request }, info) => {
      let data = await Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            amount: { $sum: '$items.price' },
            count: { $sum: 1 },
            createdAt: { $max: '$createdAt' },
          },
        },
      ])
      return data[0]
    },
    // todayTotalPaid: async (root, args, { req }: { req: Request }, info) => {
    //   let data = await Order.aggregate([
    //     { $unwind: '$items' },
    //     {
    //       $group: {
    //         _id: null,
    //         amount: { $sum: '$items.price' },
    //         paid: { $sum: '$items.paid' },
    //         count: { $sum: 1 },
    //         createdAt: { $max: '$createdAt' },
    //       }
    //     }
    //   ])
    //   return data[0]
    // },
    mySummary: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      let data = await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.vendor.id': Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            amount: { $sum: '$items.price' },
            count: { $sum: 1 },
            createdAt: { $max: '$createdAt' },
          },
        },
      ])
      return data[0]
    },
    myTodaysSummary: async (root, args, { req }: { req: Request }, info) => {
      const { start, end } = getStartEndDate(0)
      const { userId } = req.session
      let data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $unwind: '$items' },
        { $match: { 'items.vendor.id': Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            amount: { $sum: '$items.price' },
            count: { $sum: 1 },
            createdAt: { $max: '$createdAt' },
          },
        },
      ])
      return data[0]
    },

    todaysStatusSummary: async (
      root,
      args,
      { req }: { req: Request },
      info
    ) => {
      const { start, end } = getStartEndDate(0)
      const { userId } = req.session
      let data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.status',
            amount: { $sum: '$items.price' },
            count: { $sum: 1 },
            createdAt: { $max: '$createdAt' },
          },
        },
        { $sort: { _id: 1 } },
      ])
      return data
    },
    myTodaysStatusSummary: async (
      root,
      args,
      { req }: { req: Request },
      info
    ) => {
      const { start, end } = getStartEndDate(0)
      const { userId } = req.session
      let data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $unwind: '$items' },
        { $match: { 'items.vendor.id': Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$items.status',
            amount: { $sum: '$items.price' },
            count: { $sum: 1 },
            createdAt: { $max: '$createdAt' },
          },
        },
      ])
      return data
    },
    // pendingOrders: (root, args, { req }: { req: Request }, info) => {
    //   args.status = 'Waiting for confirmation'
    //   return index({ model: Order, args, info })
    // },
    ordersByStatus: (root, args, { req }: { req: Request }, info) => {
      // let userId = Types.ObjectId(args.id)
      args['items.status'] = args.status
      delete args.status
      return indexSub({ model: Order, args, info })
    },
    ordersForPickup: async (root, args, { req }: { req: Request }, info) => {
      const { start, end } = getStartEndDate(0)
      let vendor = Types.ObjectId(args.vendor)
      args['items.vendor.id'] = vendor
      args['items.status'] = args.status
      delete args.vendor
      delete args.status
      args.createdAt = { $gte: start, $lte: end }
      return indexSub({ model: Order, args, info })
    },
    myCustomers: async (root, args, { req }: { req: Request }, info) => {
      const { start, end } = getStartEndDate(0)
      let { userId } = req.session
      userId = Types.ObjectId(userId)
      // args['items.vendor.id'] = userId
      // args.createdAt = { $gte: start, $lte: end }
      // args.uid = userId
      return indexSub({ model: Order, args, info, userId })
    },
    // myOrders: async (root, args, { req }: { req: Request }, info) => {
    //   const { start, end } = getStartEndDate(0)
    //   let userId = Types.ObjectId(args.id)
    //   delete args.id
    //   args['items.vendor.id'] = userId
    //   args['items.status'] = 'Prepared'
    //   // args.createdAt = { $gte: start, $lte: end }
    //   return indexSub({ model: Order, args, info, userId })
    // },
    order: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<OrderDocument | null> => {
      await objectId.validateAsync(args)
      return Order.findById(args.id, fields(info))
    },
  },
  Mutation: {
    updateOrder: async (
      root,
      args: { id: string; pid: string; status: string },
      { req }: { req: Request }
    ): Promise<OrderDocument | null> => {
      const { userId } = req.session
      const order = await Order.findOneAndUpdate(
        { _id: args.id, 'items.pid': args.pid },
        { $set: { 'items.$.status': args.status } },
        { new: true }
      )
      if (!order) throw new UserInputError('Order not found.')
      pubsub.publish(ORDER_UPDATED, { orderUpdated: order })

      return order
    },
    collectPayment: async (
      root,
      args: { id: string; cod_paid: number },
      { req }: { req: Request }
    ): Promise<Boolean> => {
      const { userId } = req.session
      const o = await Order.updateOne(
        { _id: args.id },
        {
          $set: {
            'payment.amount_paid': args.cod_paid,
            cod_paid: args.cod_paid,
          },
        }
      )
      return o.nModified
    },

    checkout: async (root, args, { req }) => {
      // await checkout.validateAsync(args, { abortEarly: false })
      const newOrder: any = await placeOrder(req, { address: args.address })
      const amount = Math.round(newOrder.amount.total * 100)
      const payment = {
        payment_order_id: null,
        amount,
        receipt: newOrder.cartId.toString(),
        notes: { phone: newOrder.user.phone, purpose: '' },
        amount_paid: 0,
        amount_due: amount,
        status: 'created',
        method: 'COD',
        captured: false,
        email: newOrder.user.email,
        contact: newOrder.user.phone,
        fee: 0,
        error_code: null,
        error_description: null,
        invoice_id: newOrder._id,
      }
      clearCart(req)
      return Order.findByIdAndUpdate(
        { _id: newOrder._id },
        { $set: { payment } },
        { new: true }
      )
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
    },
  },

  Subscription: {
    orderUpdated: {
      resolve: (
        { orderUpdated }: { orderUpdated: OrderDocument },
        args,
        ctx,
        info
      ) => {
        orderUpdated.id = orderUpdated._id
        return hasSubfields(info)
          ? Order.findById(orderUpdated._id, fields(info))
          : orderUpdated
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator(ORDER_UPDATED),
        async (
          { orderUpdated }: { orderUpdated: OrderDocument },
          { id }: { id: string },
          { req }: { req: Request }
        ) => {
          return orderUpdated._id == id
        }
      ),
    },
  },
}

export default resolvers
