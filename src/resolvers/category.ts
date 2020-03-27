import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import {
  Request,
  CategoryDocument
} from '../types'
import { validate, objectId, categorySchema } from '../validation'
import { Chat, Category } from '../models'
import { fields, hasSubfields, index } from '../utils'

const resolvers: IResolvers = {
  Query: {
    categories: (root, args, { req }: { req: Request }, info) => {
      return index({ model: Category, args, info })
    },
    category: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<CategoryDocument | null> => {
      await objectId.validateAsync(args)
      return Category.findById(args.id, fields(info))
    }
  },
  Mutation: {
    saveCategory: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<CategoryDocument | null> => {
      const { userId } = req.session
      if (args.id == 'new')
        return await Category.create(args)
      else {
        const category = await Category.findOneAndUpdate(
          { _id: args.id },
          { ...args, user: userId },
          { new: true, upsert: true }
        )
        await category.save() // To fire pre save hoook
        return category
      }
    },
  }
}

export default resolvers
