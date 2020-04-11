import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, CategoryDocument } from '../types'
import { validate, objectId, categorySchema } from '../validation'
import { Category, Slug } from '../models'
import { fields, hasSubfields, index } from '../utils'

const resolvers: IResolvers = {
  Query: {
    categories: (root, args, { req }: { req: Request }, info) => {
      return index({ model: Category, args, info })
    },
    category: async (
      root,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<CategoryDocument | null> => {
      if (args.id) {
        await objectId.validateAsync(args)
        return Category.findById(args.id, fields(info))
      } else {
        return Category.findOne({ slug: args.slug }, fields(info))
      }
    }
  },
  Mutation: {
    deleteCategory: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<Boolean> => {
      const category: any = await Category.findByIdAndDelete(args.id)
      if (category) {
        await Slug.deleteOne({ slug: category.slug })
        return true
      } else {
        return false
      }
    },
    saveCategory: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<CategoryDocument | null> => {
      const { userId } = req.session
      if (args.id == 'new') return await Category.create(args)
      else {
        const category = await Category.findOneAndUpdate(
          { _id: args.id },
          { ...args, user: userId },
          { new: true, upsert: true }
        )
        await category.save() // To fire pre save hoook
        return category
      }
    }
  }
}

export default resolvers
