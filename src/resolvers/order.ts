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

const resolvers: IResolvers = {
  Query: {
    orders: (root, args, ctx, info): Promise<OrderDocument[]> => {
      return Order.find({}, fields(info)).exec()
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
    createOrder: async (
      root,
      args: {
        originalFilename: string
        src: string
        path: string
        size: string
        type: string
        name: string
        use: string
        active: boolean
      },
      { req }: { req: Request }
    ): Promise<OrderDocument> => {
      await createOrder.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      const order = await Order.create({ ...args, uid: userId })

      await order.save()

      return order
    }
  }
}

export default resolvers
