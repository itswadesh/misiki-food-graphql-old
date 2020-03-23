import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import {
  Request,
  MessageDocument,
  UserDocument,
  PaymentDocument,
  ProductDocument,
  OrderDocument
} from '../types'
import { objectId } from '../validation'
import { PAY_MESSAGE } from '../config'
import { Order, Product, Payment } from '../models'
import { placeOrder, fields, index } from '../utils'
let Razorpay = require('razorpay')
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env
var instance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
})

const resolvers: IResolvers = {
  Query: {
    payments: (root, args, { req }: { req: Request }, info) => {
      return index({ model: Payment, args, info })
    },
    payment: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<PaymentDocument | null> => {
      await objectId.validateAsync(args)
      return Payment.findById(args.id, fields(info))
    },
    razorpays: async (root, args, ctx, info): Promise<PaymentDocument[]> => {
      const payments = await instance.payments.all()
      payments.data = payments.items
      return payments
    }
  },
  Mutation: {
    razorpay: async (
      root,
      args: { address: any },
      { req }
    ): Promise<PaymentDocument> => {
      const { userId, cart } = req.session
      if (!userId) throw new UserInputError("User not found")
      if (!cart) {
        throw new UserInputError('Cart was not found')
      }
      const { cart_id, phone, total, items } = cart
      if (!items || !cart_id) {
        throw new UserInputError('Cart was not found')
      }
      if (total < 1) {
        throw new UserInputError('No items in cart')
      }
      // throw new UserInputError("Please specify your address");
      const newOrder: any = await placeOrder(req, { address: args.address })
      try {
        const payment = await instance.orders.create({
          amount: Math.round(total * 100),
          receipt: cart_id.toString(),
          notes: {
            phone,
            purpose: PAY_MESSAGE
          }
        })
        await Order.updateOne(
          { _id: newOrder._id },
          { $set: { payment, payment_order_id: payment.id } }
        )
        payment.invoice_id = newOrder._id
        payment.payment_order_id = payment.id
        await Payment.create(payment)

        // await payment.save()
        return payment
      } catch (e) {
        console.log('Pay err...', e);
        throw new UserInputError(e)
      }
    },
    capturePay: async (
      root,
      args: { payment_id: string; oid: string },
      { req }: { req: Request },
      info
    ): Promise<OrderDocument> => {
      let o = await Order.findOne({ payment_order_id: args.oid })
      if (!o) throw new UserInputError('Order not found. Please try again')
      const amount = Math.round(o.amount.total * 100)
      const payment = await instance.payments.capture(args.payment_id, amount)
      await Order.updateOne(
        { payment_order_id: payment.order_id },
        { $set: { payment } }
      )
      await Payment.updateOne({ payment_order_id: payment.order_id }, { $set: payment })

      for (let i of o.items) {
        let p: ProductDocument | null = await Product.findById(i)
        if (p) {
          await Product.update(
            { _id: i._id },
            {
              $set: {
                popularity: +p.stats.popularity + 10,
                stock: +p.stock - +i.qty
              }
            }
          ) // Reduce stock for that
        }
      }
      req.session.cart = {}
      return o
    }
  }
}

export default resolvers