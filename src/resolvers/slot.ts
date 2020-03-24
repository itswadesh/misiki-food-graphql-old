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
import { fields, hasSubfields, index } from '../utils'
import { slotSchema } from '../validation/slot'

const resolvers: IResolvers = {
  Query: {
    slots: (root, args, { req }: { req: Request }, info) => {
      return index({ model: Slot, args, info })
    },
    slot: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<SlotDocument | null> => {
      await objectId.validateAsync(args)
      return Slot.findById(args.id, fields(info))
    },
  },
  Mutation: {
    saveSlot: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<SlotDocument | null> => {
      const { userId } = req.session
      const slot = await Slot.findOneAndUpdate(
        { _id: args.id },
        { ...args, uid: userId },
        { new: true, upsert: true }
      )
      await slot.save() // To fire pre save hoook
      return slot
    },
  }
}

export default resolvers
