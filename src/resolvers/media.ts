import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, MediaDocument } from '../types'
import { createMedia, objectId } from '../validators'
import { Chat, Media } from '../models'
import { fields, hasSubfields } from '../utils'
import pubsub from '../pubsub'

const MESSAGE_SENT = 'MESSAGE_SENT'

const resolvers: IResolvers = {
  Query: {
    medias: (root, args, ctx, info): Promise<MediaDocument[]> => {
      return Media.find({}, fields(info)).exec()
    },
    media: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<MediaDocument | null> => {
      await objectId.validateAsync(args)
      return Media.findById(args.id, fields(info))
    }
  },
  Mutation: {
    createMedia: async (
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
    ): Promise<MediaDocument> => {
      await createMedia.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      const media = await Media.create({ ...args, uid: userId })

      await media.save()

      return media
    }
  }
}

export default resolvers
