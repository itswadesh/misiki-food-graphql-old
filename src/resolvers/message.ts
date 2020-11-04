import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, MessageDocument } from '../types'
import { validate, objectId, couponSchema } from '../validation'
import { Message, User } from '../models'
import { fields, index } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    messages: (root:any, args:any, { req }: { req: Request }, info) => {
      return index({ model: Message, args, info })
    },
    message: async (
      root:any,
      args: { id: string },
      ctx,
      info
    ): Promise<MessageDocument | null> => {
      return Message.findById(args.id, fields(info))
    }
  },
  Mutation: {
    removeMessage: async (
      root:any,
      args:any,
      { req }: { req: Request }
    ): Promise<MessageDocument | null> => {
      const { userId } = req.session
      const message = await Message.findById(args.id)
      if (!message) throw new UserInputError('Message not found')
      const user = await User.findById(userId)
      if (!user) throw new UserInputError('Please login again to continue')
      if (user.role != 'admin' && message.user == userId)
        throw new UserInputError('Message does not belong to you')
      return await Message.findByIdAndDelete({ _id: args.id })
    },
    saveMessage: async (
      root:any,
      args:any,
      { req }: { req: Request }
    ): Promise<MessageDocument | null> => {
      const { userId } = req.session
      const message = await Message.findOneAndUpdate(
        { _id: args.id || Types.ObjectId() },
        { $set: { ...args, user: userId } },
        { upsert: true, new: true }
      )
      await message.save() // To fire pre save hoook
      return message
    }
  }
}

export default resolvers
