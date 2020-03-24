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
import { validate, objectId } from '../validation'
import { Chat, Review } from '../models'
import { fields, hasSubfields } from '../utils'
import { reviewSchema } from '../validation/review'

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
    saveReview: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<ReviewDocument | null> => {
      const { userId } = req.session
      const review = await Review.findOneAndUpdate(
        { _id: args.id },
        { ...args, uid: userId },
        { new: true, upsert: true }
      )
      return review
    },
  }
}

export default resolvers
