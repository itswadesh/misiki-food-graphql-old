import { IResolvers } from 'apollo-server-express'
import { Request, BannerDocument } from '../types'
import { validate, objectId, bannerSchema } from '../validation'
import { Banner } from '../models'
import { fields, index } from '../utils'

const resolvers: IResolvers = {
  Query: {
    banners: (root, args, { req }: { req: Request }, info) => {
      return index({ model: Banner, args, info })
    },
    banner: async (root, args: { id: string }, ctx, info): Promise<BannerDocument | null> => {
      return Banner.findById(args.id, fields(info))
    }
  },
  Mutation: {
    saveBanner: async (root, args, { req }: { req: Request }): Promise<BannerDocument | null> => {
      const { userId } = req.session
      if (args.id == 'new')
        return await Banner.create(args)
      else {
        let banner = await Banner.findOneAndUpdate(
          { _id: args.id },
          { ...args, uid: userId },
          { new: true, upsert: true }
        )
        await banner.save() // To fire pre save hoook
        return banner
      }
    }
  }
}

export default resolvers
