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
import { validate, objectId } from '../validation'
import { Chat, Wishlist } from '../models'
import { fields, hasSubfields } from '../utils'
import { wishlistSchema } from '../validation/wishlist'

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
      await wishlistSchema.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      const wishlist = await Wishlist.create({ ...args, uid: userId })

      await wishlist.save()

      return wishlist
    }
  }
}

export default resolvers
