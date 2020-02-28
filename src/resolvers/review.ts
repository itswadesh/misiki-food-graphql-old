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
  ReviewDocument
} from '../types'
import { createReview, objectId } from '../validators'
import { Chat, Review } from '../models'
import { fields, hasSubfields } from '../utils'

const resolvers: IResolvers = {
  Query: {
    reviews: (root, args, ctx, info): Promise<ReviewDocument[]> => {
      return Review.find({}, fields(info)).exec()
    },
    review: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<ReviewDocument | null> => {
      await objectId.validateAsync(args)
      return Review.findById(args.id, fields(info))
    }
  },
  Mutation: {
    createReview: async (
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
    ): Promise<ReviewDocument> => {
      await createReview.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      const review = await Review.create({ ...args, uid: userId })

      await review.save()

      return review
    }
  }
}

export default resolvers