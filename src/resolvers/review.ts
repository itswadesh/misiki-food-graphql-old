import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import {
  Request,
  MessageDocument,
  UserDocument,
  ReviewDocument,
  SettingsDocument,
  ProductDocument,
} from '../types'
import { validate, objectId } from '../validation'
import { Review, Setting, Order, Product, User } from '../models'
import { fields, hasSubfields, index, updateStats } from '../utils'
import { reviewSchema } from '../validation/review'
import { ObjectId } from 'mongodb'

const resolvers: IResolvers = {
  Query: {
    reviews: (root:any, args:any, ctx, info) => {
      args.populate = 'product user vendor'
      return index({ model: Review, args, info })
    },
    review: async (
      root:any,
      args: { id: string },
      ctx,
      info
    ): Promise<ReviewDocument | null> => {
      await objectId.validateAsync(args)
      return Review.findById(args.id, fields(info))
    },
    productReviews: async (root:any, args:any, ctx, info) => {},
    reviewSummary: async (root:any, args:any, ctx, info) => {
      const reviews = await Review.aggregate([
        { $match: { product: Types.ObjectId(args.product) } },
        {
          $group: {
            _id: '$product',
            avg: { $avg: '$rating' },
            count: { $sum: 1 },
            total: { $sum: '$rating' },
            reviews: { $addToSet: '$message' },
          },
        },
        {
          $project: {
            _id: 1,
            avg: '$avg',
            count: 1,
            total: 1,
            reviews: 1,
          },
        },
      ])
      return reviews[0]
    },
  },
  Mutation: {
    removeReview: async (
      root:any,
      args:any,
      { req }: { req: Request }
    ): Promise<ReviewDocument | null> => {
      const { userId } = req.session
      const review = await Review.findById(args.id)
      if (!review) throw new UserInputError('Review not found')
      const user = await User.findById(userId)
      if (!user) throw new UserInputError('Please login again to continue')
      if (user.role != 'admin' && review.user == userId)
        throw new UserInputError('Review does not belong to you')
      return await Review.findByIdAndDelete({ _id: args.id })
    },
    saveReview: async (
      root:any,
      args:any,
      { req }: { req: Request }
    ): Promise<ReviewDocument | null> => {
      const { userId } = req.session
      const settings = await Setting.findOne({}).exec()
      if (!settings) throw new UserInputError('Invalid settings')
      if (settings.review.moderate) req.body.active = false
      const product = await Product.findById(args.product)
      if (!product) throw new UserInputError('Product not found')
      const order = await Order.findOne({
        'items.pid': new ObjectId(product._id),
        'user.id': userId,
      })
      if (!order) throw new UserInputError('You have never ordered this item')
      const p = order.items.find((element) => element.pid == args.product)
      if (p.reviewed)
        throw new UserInputError('You have already reviewed this item...')

      p.reviewed = true
      const review = await Review.findOneAndUpdate(
        { _id: args.id || Types.ObjectId() },
        { ...args, user: userId, vendor: product.vendor },
        { new: true, upsert: true }
      )
        .populate('user')
        .populate('product')
      await review.save() // To fire pre save hoook
      await order.save()
      // await Order.updateMany({ 'items.pid': new ObjectId(product._id), 'user.id': userId }, { $set: { 'items.$.reviewed': true } })
      updateStats(product)
      return review
    },
  },
}

export default resolvers
