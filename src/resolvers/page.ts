import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, PageDocument } from '../types'
import { createPage, objectId } from '../validators'
import { Chat, Page } from '../models'
import { fields, hasSubfields } from '../utils'

const resolvers: IResolvers = {
  Query: {
    pages: (root, args, ctx, info): Promise<PageDocument[]> => {
      return Page.find({}, fields(info)).exec()
    },
    page: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<PageDocument | null> => {
      await objectId.validateAsync(args)
      return Page.findById(args.id, fields(info))
    }
  },
  Mutation: {
    createPage: async (
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
    ): Promise<PageDocument> => {
      await createPage.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      const page = await Page.create({ ...args, uid: userId })

      await page.save()

      return page
    }
  }
}

export default resolvers
