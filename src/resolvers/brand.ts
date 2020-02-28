import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, BrandDocument } from '../types'
import { createBrand, objectId } from '../validators'
import { Chat, Brand } from '../models'
import { fields, hasSubfields } from '../utils'

const resolvers: IResolvers = {
  Query: {
    brands: (root, args, ctx, info): Promise<BrandDocument[]> => {
      return Brand.find({}, fields(info)).exec()
    },
    brand: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<BrandDocument | null> => {
      await objectId.validateAsync(args)
      return Brand.findById(args.id, fields(info))
    }
  },
  Mutation: {
    createBrand: async (
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
    ): Promise<BrandDocument> => {
      await createBrand.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      const brand = await Brand.create({ ...args, uid: userId })

      await brand.save()

      return brand
    }
  }
}

export default resolvers
