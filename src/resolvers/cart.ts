import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, CartDocument } from '../types'
import { validate, objectId, cartSchema } from '../validation'
import { Cart } from '../models'
import { fields, hasSubfields } from '../utils'
import { clearCart, addToCart } from '../utils/cart'

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
    getCartQty: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<Number> => {
      const { userId } = req.session
      return 10
    },
    cart: async (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<CartDocument | null> => {
      const { userId } = req.session
      let cart = null
      if (!userId) cart = req.session.cart
      else cart = await Cart.findOne({ uid: userId })
      if (!cart) cart = req.session.cart
      return cart || req.session.cart
    }
  },
  Mutation: {
    addToCart: async (
      root,
      args: {
        pid: string
        vid: string
        qty: number
        replace: boolean
      },
      { req }: { req: Request }
    ): Promise<CartDocument> => {
      await validate(cartSchema, args)
      const { pid, vid, qty, replace } = args
      // const cart = await Cart.create({ pid, vid, qty})
      // await cart.save()
      return addToCart(req, { pid, vid, qty, replace })
    },
    clearCart: async (root, _, { req }: { req: Request }): Promise<Boolean> => {
      clearCart(req)
      return true
    }
  }
}

export default resolvers
