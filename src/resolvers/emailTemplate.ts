const fs = require('fs')
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
  EmailTemplateDocument
} from '../types'
import { validate, objectId } from '../validation'
import { Page, User } from '../models'
import { STATIC_PATH } from '../config'

const resolvers: IResolvers = {
  Query: {
    emailTemplates: async (root, args, ctx, info) => {
      const result: any = await fs.readFileSync(
        `${STATIC_PATH}/templates/${args.folder}/${args.name}.hbs`,
        'utf8'
      )
      if (!result) throw new UserInputError('Page not found')
      else return result
    },
    emailTemplate: async (
      root,
      args: { id: string; name: string },
      ctx,
      info
    ): Promise<EmailTemplateDocument | null> => {
      const result: any = await fs.readFileSync(
        `${STATIC_PATH}/templates/${args.name}.hbs`,
        'utf8'
      )
      if (!result) throw new UserInputError('Page not found')
      else return result
    }
  },
  Mutation: {
    // removeEmailTemplate: async (root, args, { req }: { req: Request }): Promise<EmailTemplateDocument | null> => {
    //   const { userId } = req.session
    //   const emailTemplate = await Page.findById(args.id)
    //   if (!emailTemplate) throw new UserInputError('Page not found')
    //   const user = await User.findById(userId)
    //   if (!user) throw new UserInputError('Please login again to continue')
    //   if (user.role != 'admin')
    //     throw new UserInputError('Page does not belong to you')
    //   return await Page.findByIdAndDelete({ _id: args.id })
    // },
    saveEmailTemplate: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<EmailTemplateDocument> => {
      return fs.writeFileSync(
        `${STATIC_PATH}/templates/${args.name}.hbs`,
        args.content,
        'utf8'
      )
    }
  }
}

export default resolvers
