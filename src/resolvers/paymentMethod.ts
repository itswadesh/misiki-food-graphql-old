import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, PaymentMethodDocument } from '../types'
import { objectId } from '../validation'
import { PaymentMethod, Slug } from '../models'
import { fields, index } from '../utils'
import { ObjectId } from 'mongodb'

const resolvers: IResolvers = {
  Query: {
    paymentMethods: (root, args, { req }: { req: Request }, info) => {
      args.sort = 'position'
      return index({ model: PaymentMethod, args, info })
    },
    paymentMethod: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<PaymentMethodDocument | null> => {
      if (args.id) {
        await objectId.validateAsync(args)
        return PaymentMethod.findById(args.id, fields(info))
      } else {
        return PaymentMethod.findOne({ slug: args.slug }, fields(info))
      }
    },
  },
  Mutation: {
    deletePaymentMethod: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<Boolean> => {
      const paymentMethod: any = await PaymentMethod.findByIdAndDelete(args.id)
      if (paymentMethod) {
        await Slug.deleteOne({ slug: paymentMethod.slug })
        return true
      } else {
        return false
      }
    },
    savePaymentMethod: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<PaymentMethodDocument | null> => {
      const { userId } = req.session
      let paymentMethod
      if (args.id == 'new') {
        paymentMethod = await PaymentMethod.create(args)
      } else {
        if (!ObjectId.isValid(args.id)) {
          throw new UserInputError('Record not found')
        }
        paymentMethod = await PaymentMethod.findOneAndUpdate(
          { _id: args.id },
          { ...args, user: userId },
          { new: true, upsert: true }
        )
        await paymentMethod.save() // To fire pre save hoook
      }
      return paymentMethod
    },
  },
}

export default resolvers
