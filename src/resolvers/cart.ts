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
import { removeFromCartSession, addToCart } from '../utils/cart'

const resolvers: IResolvers = {
  Query: {
    abandoned: async (root, args, ctx, info): Promise<CartDocument[]> => {
      return await Cart.find({ subtotal: { $gt: 0 } }, fields(info))
        .sort('-updatedAt')
        .exec()
    },
    carts: (root, args, ctx, info): Promise<CartDocument[]> => {
      return Cart.find({}, fields(info)).exec()
    },
    myCart: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<CartDocument | null> => {
      const { userId } = req.session
      return (req.session.cart = Cart.findOne(
        { uid: userId },
        fields(info)
      ).exec())
    }
  },
  Mutation: {
    add: async (
      root,
      args: {
        pid: string
        vid: string
        qty: number
      },
      { req }: { req: Request }
    ): Promise<CartDocument> => {
      await createCart.validateAsync(args, { abortEarly: false })
      const { pid, vid, qty } = args
      // const cart = await Cart.create({ pid, vid, qty})
      // await cart.save()
      return addToCart(req, { pid, vid, qty })
    }
  }
}

export default resolvers
