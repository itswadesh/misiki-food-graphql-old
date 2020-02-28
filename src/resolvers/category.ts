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
  CategoryDocument
} from '../types'
import { createCategory, objectId } from '../validators'
import { Chat, Category } from '../models'
import { fields, hasSubfields } from '../utils'

const resolvers: IResolvers = {
  Query: {
    categories: (root, args, ctx, info): Promise<CategoryDocument[]> => {
      return Category.find({}, fields(info)).exec()
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
    createCategory: async (
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
    ): Promise<CategoryDocument> => {
      await createCategory.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      const category = await Category.create({ ...args, uid: userId })

      await category.save()

      return category
    }
  }
}

export default resolvers
