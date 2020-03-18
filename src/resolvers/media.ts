import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, UserDocument, MediaDocument } from '../types'
import { validate, mediaSchema, objectId } from '../validation'
import { Media } from '../models'
import { fields, hasSubfields } from '../utils'
import pubsub from '../pubsub'
import {
  storeToFileSystem,
  store1ToFileSystem,
  deleteFile
} from '../utils/image'

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
    deleteFile: async (root, args, { req }: { req: Request }) => {
      return await deleteFile(args.path)
    },
    singleUpload: async (root, args, { req }: { req: Request }) => {
      const { userId } = req.session
      const file = await store1ToFileSystem(args)
      return file
    },
    fileUpload: async (root, args, { req }: { req: Request }) => {
      const { userId } = req.session
      const files = await storeToFileSystem(args)
      return files
    },
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
      await validate(mediaSchema, args)
      const { userId } = req.session
      const media = await Media.create({ ...args, uid: userId })

      await media.save()

      return media
    }
  }
}

export default resolvers
