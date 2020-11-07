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
import { placeOrder, fields, index, clearCart } from '../utils'
let Razorpay = require('razorpay')
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env
var instance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
})

const resolvers: IResolvers = {
  Query: {
    payments: (root:any, args:any, { req }: { req: Request }, info) => {
      return index({ model: Payment, args, info })
    },
    payment: async (
      root:any,
      args: { id: string },
      ctx,
      info
    ): Promise<PaymentDocument | null> => {
      await objectId.validateAsync(args)
      return Payment.findById(args.id, fields(info))
    },
    razorpays: async (root:any, args:any, ctx, info): Promise<PaymentDocument[]> => {
      const payments = await instance.payments.all()
      payments.data = payments.items
      return payments
    }
  },
  Mutation: {
    razorpay: async (
      root:any,
      args: { address: any, location: any },
      { req }
    ): Promise<PaymentDocument> => {
      // throw new UserInputError("Please specify your address");
      const newOrder: any = await placeOrder(req, { address: args.address,location:args.location })
      // try {
      const amount = Math.round(newOrder.amount.total * 100)
      const payment = await instance.orders.create({
        amount,
        receipt: newOrder.cartId.toString(),
        notes: { phone: newOrder.user.phone, purpose: PAY_MESSAGE }
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
      // } catch (e) {
      //   console.log('Pay err...', e);
      //   throw new UserInputError(e)
      // }
    },
    capturePay: async (
      root:any,
      args: { payment_id: string; oid: string },
      { req }: { req: Request },
      info
    ): Promise<OrderDocument> => {
      let o = await Order.findOne({ payment_order_id: args.oid })
      if (!o) throw new UserInputError('Order not found. Please try again')
      const amount = Math.round(o.amount.total * 100)
      const payment = await instance.payments.capture(args.payment_id, amount)
      if (payment.status == 'captured') {
        payment.amount_paid = payment.amount
        payment.amount_due = 0
      } else {
        payment.amount_paid = 0
        payment.amount_due = payment.amount
      }
      await Order.updateOne(
        { payment_order_id: payment.order_id },
        { $set: { payment } }
      )
      await Payment.updateOne(
        { payment_order_id: payment.order_id },
        { $set: payment }
      )

      for (let i of o.items) {
        let p: ProductDocument | null = await Product.findById(i)
        if (p) {
          await Product.update(
            { _id: i._id },
            {
              $set: {
                popularity: +p.popularity + 10,
                stock: +p.stock - +i.qty
              }
            }
          ) // Reduce stock for that
        }
      }
      clearCart(req)
      return o
    }
  }
}

export default resolvers
