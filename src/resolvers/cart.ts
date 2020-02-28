import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, CartDocument } from '../types'
import { createCart, objectId } from '../validators'
import { Chat, Cart } from '../models'
import { fields, hasSubfields } from '../utils'

const resolvers: IResolvers = {
  Query: {
    carts: (root, args, ctx, info): Promise<CartDocument[]> => {
      return Cart.find({}, fields(info)).exec()
    },
    cart: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<CartDocument | null> => {
      await objectId.validateAsync(args)
      return Cart.findById(args.id, fields(info))
    }
  },
  Mutation: {
    addToCart: async (
      root,
      args: {
        pid: string
        vid: string
        qty: number
      },
      { req }: { req: Request }
    ): Promise<CartDocument> => {
      await createCart.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      const cart = await Cart.create({ ...args, uid: userId })

      await cart.save()

      return cart
    }
  }
}

export default resolvers
