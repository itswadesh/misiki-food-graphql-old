import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, PageDocument } from '../types'
import { validate, objectId } from '../validation'
import { Page, User } from '../models'
import { fields, hasSubfields, index } from '../utils'
import { pageSchema } from '../validation/page'

const resolvers: IResolvers = {
  Query: {
    pages: (root, args, ctx, info) => {
      return index({ model: Page, args, info })
    },
    pageSlug: async (root, args: { slug: string }, ctx, info): Promise<PageDocument | null> => {
      // await objectId.validateAsync(args)
      return Page.findOne({ slug: args.slug }, fields(info))
    },
    page: async (root, args: { id: string }, ctx, info): Promise<PageDocument | null> => {
      if (args.id != 'new') {
        await objectId.validateAsync(args)
        return Page.findById(args.id, fields(info))
      }
      else {
        return null
      }
    }
  },
  Mutation: {
    removePage: async (root, args, { req }: { req: Request }): Promise<PageDocument | null> => {
      const { userId } = req.session
      const page = await Page.findById(args.id)
      if (!page) throw new UserInputError('Page not found')
      const user = await User.findById(userId)
      if (!user) throw new UserInputError('Please login again to continue')
      if (user.role != 'admin' && page.user == userId)
        throw new UserInputError('Page does not belong to you')
      return await Page.findByIdAndDelete({ _id: args.id })
    },
    savePage: async (root,
      args: {
        id: string
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
    ): Promise<PageDocument> => {
      // await validate(pageSchema, args)
      if (args.id == 'new') delete args.id
      const { userId } = req.session
      const page = await Page.findOneAndUpdate({ _id: args.id || Types.ObjectId() }, { $set: { ...args, user: userId } }, { upsert: true, new: true })
      await page.save() // To fire pre save hoook
      return page
    }
  }
}

export default resolvers
