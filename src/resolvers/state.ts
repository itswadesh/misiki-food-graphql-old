import { Types } from 'mongoose'
import {
  IResolvers,
} from 'apollo-server-express'
import { Request, StateDocument } from '../types'
import { objectId } from '../validation'
import { State, Slug } from '../models'
import { fields, hasSubfields, index } from '../utils'

const resolvers: IResolvers = {
  Query: {
    states: (root:any, args:any, { req }: { req: Request }, info) => {
      return index({ model: State, args, info })
    },
    state: async (
      root:any,
      args: { id: string; slug: string },
      ctx,
      info
    ): Promise<StateDocument | null> => {
      if (args.id) {
        await objectId.validateAsync(args)
        return State.findById(args.id, fields(info))
      } else {
        return State.findOne({ slug: args.slug }, fields(info))
      }
    },
  },
  Mutation: {
    deleteState: async (
      root:any,
      args:any,
      { req }: { req: Request }
    ): Promise<Boolean> => {
      const state: any = await State.findByIdAndDelete(args.id)
      if (state) {
        await Slug.deleteOne({ slug: state.slug })
        return true
      } else {
        return false
      }
    },
    saveState: async (
      root:any,
      args:any,
      { req }: { req: Request }
    ): Promise<StateDocument | null> => {
      const { userId } = req.session
      if (args.id == 'new') return await State.create(args)
      else {
        const state = await State.findOneAndUpdate(
          { _id: args.id },
          { ...args, user: userId },
          { new: true, upsert: true }
        )
        await state.save() // To fire pre save hoook
        return state
      }
    },
  },
}

export default resolvers
