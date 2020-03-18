import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, SlotDocument } from '../types'
import { validate, objectId } from '../validation'
import { Chat, Slot } from '../models'
import { fields, hasSubfields } from '../utils'
import { slotSchema } from '../validation/slot'

const resolvers: IResolvers = {
  Query: {
    slots: (root, args, ctx, info): Promise<SlotDocument[]> => {
      return Slot.find({}, fields(info)).exec()
    },
    slot: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<SlotDocument | null> => {
      await objectId.validateAsync(args)
      return Slot.findById(args.id, fields(info))
    }
  },
  Mutation: {
    createSlot: async (
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
    ): Promise<SlotDocument> => {
      await slotSchema.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      const slot = await Slot.create({ ...args, uid: userId })

      await slot.save()

      return slot
    }
  }
}

export default resolvers
