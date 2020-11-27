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
import { Wishlist } from '../models'
import { fields, hasSubfields } from '../utils'
import { wishlistSchema } from '../validation/wishlist'

const resolvers: IResolvers = {
  Query: {
    wishlists: (root:any, args:any, ctx:any, info:any): Promise<WishlistDocument[]> => {
      return Wishlist.find({}, fields(info)).exec()
    },
    wishlist: async (
      root:any,
      args: { id: string },
      ctx:any,
      info:any
    ): Promise<WishlistDocument | null> => {
      await objectId.validateAsync(args)
      return Wishlist.findById(args.id, fields(info))
    }
  },
  Mutation: {
    createWishlist: async (
      root:any,
      args: {
        originalFilename: string
        src: string
        path: string
        size: string
        type: string
        name: string
        use: string
        user: string
        active: boolean
      },
      { req }: { req: Request }
    ): Promise<WishlistDocument> => {
      await wishlistSchema.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      args.user = userId
      const wishlist = new Wishlist(args)
      await wishlist.save()

      return wishlist
    }
  }
}

export default resolvers
