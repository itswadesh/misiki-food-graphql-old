import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, PayDocument, ProductDocument } from '../types'
import { objectId, createPay } from '../validators'
import { PAY_MESSAGE } from '../config'
import { Order, Product } from '../models'
import { placeOrder } from '../utils'
let Razorpay = require("razorpay")
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env
var instance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

const resolvers: IResolvers = {
  Query: {
    pays: async (root, args, ctx, info): Promise<PayDocument[]> => {
      const payments = await instance.payments.all();
      payments.data = payments.items
      return payments
    },

  },
  Mutation: {
    razorpay: async (
      root,
      args: { address: string },
      { req }: { req: Request }
    ): Promise<PayDocument> => {

      await createPay.validateAsync(args, { abortEarly: false })

      const { userId, cart } = req.session
      if (!cart) {
        throw new UserInputError('Cart was not found')
      }
      const { cart_id, phone, total, items } = cart;
      if (!items || !cart_id) {
        throw new UserInputError('Cart was not found')
      }
      if (total < 1) {
        throw new UserInputError("No items in cart");
      }
      // throw new UserInputError("Please specify your address");
      const newOrder: any = await placeOrder(req);

      const payment = await instance.orders.create({
        amount: total * 100,
        receipt: cart_id.toString(),
        notes: {
          phone: phone,
          purpose: PAY_MESSAGE
        }
      });
      await Order.updateOne(
        { _id: newOrder._id },
        { $set: { payment, payment_order_id: payment.id } }
      );

      await payment.save()

      return payment
    },
    capturePay: async (
      root,
      args: { payment_id: string, oid: string },
      { req }: { req: Request }
    ): Promise<PayDocument> => {
      let o = await Order.findOne({ payment_order_id: args.oid });
      if (!o) throw new UserInputError("Order not found. Please try again");
      const amount = o.amount.total * 100;
      const payment = await instance.payments.capture(args.payment_id, amount);
      await Order.updateOne(
        { payment_order_id: payment.order_id },
        { $set: { payment } }
      );
      for (let i of o.items) {
        const p: ProductDocument = await Product.findById(i);
        await Product.update(
          { _id: i._id },
          {
            $set: {
              popularity: +p.stats.popularity + 10,
              qty: +p.qty - +i.qty
            }
          }
        ); // Reduce stock for that
      }
      req.session.cart = {};
      if (payment.captured) return o._id
      else return payment
    }
  }
}

export default resolvers
