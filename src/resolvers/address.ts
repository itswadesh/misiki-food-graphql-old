import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, AddressDocument, UserDocument } from '../types'
import { createAddress, objectId } from '../validators'
import { Chat, Message, Address } from '../models'
import { fields, hasSubfields } from '../utils'
import pubsub from '../pubsub'

const MESSAGE_SENT = 'MESSAGE_SENT'

const resolvers: IResolvers = {
  Query: {
    addresses: (root, args, ctx, info): Promise<AddressDocument[]> => {
      return Address.find({}, fields(info)).exec()
    },
    address: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<AddressDocument | null> => {
      await objectId.validateAsync(args)
      return Address.findById(args.id, fields(info))
    }
  },
  Mutation: {
    createAddress: async (
      root,
      args: {
        email: string
        firstName: string
        lastName: string
        address: string
        town: string
        city: string
        country: string
        state: string
        zip: number
        phone: string
        coords: { lat: number; lng: number }
      },
      { req }: { req: Request }
    ): Promise<AddressDocument> => {
      await createAddress.validateAsync(args, { abortEarly: false })
      const { userId } = req.session
      const address = await Address.create({ ...args, uid: userId })

      await address.save()

      return address
    }
  }
}

export default resolvers
