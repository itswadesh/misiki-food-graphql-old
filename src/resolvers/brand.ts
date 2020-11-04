import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, BrandDocument } from '../types'
import { validate, brandSchema, objectId } from '../validation'
import { Brand } from '../models'
import { fields, hasSubfields } from '../utils'

const resolvers: IResolvers = {
  Query: {
    brands: (root:any, args:any, ctx, info): Promise<BrandDocument[]> => {
      return Brand.find({}, fields(info)).exec()
    },
    brand: async (
      root:any,
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
      root:any,
      args: {
        originalFilename: string
        src: string
        path: string
        size: string
        type: string
        name: string
        use: string
        user: string
        active: boolean
      },
      { req }: { req: Request }
    ): Promise<BrandDocument> => {
      await validate(brandSchema, args)
      const { userId } = req.session
      args.user = userId
      const brand = new Brand(args)
      await brand.save()

      return brand
    }
  }
}

export default resolvers
