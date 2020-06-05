import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, CityDocument } from '../types'
import { validate, objectId, couponSchema } from '../validation'
import { City, User } from '../models'
import { fields, index } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    cities: async (root, args, { req }: { req: Request }, info) => {
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) args.active = true
      if (user && user.role != 'admin') args.active = true
      return index({ model: City, args, info })
    },
    city: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<CityDocument | null> => {
      return City.findById(args.id, fields(info))
    },
  },
  Mutation: {
    removeCity: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<CityDocument | null> => {
      const { userId } = req.session
      const city = await City.findById(args.id)
      if (!city) throw new UserInputError('City not found')
      const user = await User.findById(userId)
      if (!user) throw new UserInputError('Please login again to continue')
      if (user.role != 'admin' && city.user == userId)
        throw new UserInputError('City does not belong to you')
      return await City.findByIdAndDelete({ _id: args.id })
    },
    saveCity: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<CityDocument | null> => {
      if (args.id == 'new') delete args.id
      const { userId } = req.session
      const city = await City.findOneAndUpdate(
        { _id: args.id || Types.ObjectId() },
        { $set: { ...args, user: userId } },
        { upsert: true, new: true }
      )
      await city.save() // To fire pre save hoook
      return city
    },
  },
}

export default resolvers
