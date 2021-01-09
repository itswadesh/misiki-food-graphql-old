import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, MessageDocument, UserDocument, SlotDocument } from '../types'
import { validate, objectId } from '../validation'
import { Slot, User } from '../models'
import { fields, hasSubfields, index } from '../utils'
import { slotSchema } from '../validation/slot'

const resolvers: IResolvers = {
  Query: {
    slots: async (root: any, args: any, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const user = await User.findById(userId)
      if (user && user.role === 'admin') {
      } else {
        args.active = true
      }
      return index({ model: Slot, args, info })
    },
    slot: async (
      root: any,
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
      root: any,
      args: any,
      { req }: { req: Request }
    ): Promise<SlotDocument | null> => {
      const { userId } = req.session
      if (args.id == 'new') return await Slot.create(args)
      else {
        const slot = await Slot.findOneAndUpdate(
          { _id: args.id },
          { ...args, user: userId },
          { new: true, upsert: true }
        )
        await slot.save() // To fire pre save hoook
        return slot
      }
    },
  },
}

export default resolvers
