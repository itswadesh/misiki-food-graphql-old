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
  WishlistDocument
} from '../types'
import { createWishlist, objectId } from '../validators'
import { Chat, Wishlist } from '../models'
import { fields, hasSubfields } from '../utils'

const resolvers: IResolvers = {
  Query: {
    wishlists: (root, args, ctx, info): Promise<WishlistDocument[]> => {
      return Wishlist.find({}, fields(info)).exec()
    },
    wishlist: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<WishlistDocument | null> => {
      await objectId.validateAsync(args)
      return Wishlist.findById(args.id, fields(info))
    }
  },
  Mutation: {
    createWishlist: async (
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
    ): Promise<WishlistDocument> => {
      await createWishlist.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      const wishlist = await Wishlist.create({ ...args, uid: userId })

      await wishlist.save()

      return wishlist
    }
  }
}

export default resolvers
