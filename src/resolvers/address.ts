import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import { Request, AddressDocument, UserDocument } from '../types'
import { validate, addressSchema, objectId } from '../validation'
import { Chat, Message, Address } from '../models'
import { fields, hasSubfields } from '../utils'
import pubsub from '../pubsub'
import axios from 'axios'
const { OPENCAGE_KEY } = process.env
const MESSAGE_SENT = 'MESSAGE_SENT'

const resolvers: IResolvers = {
  Query: {
    getLocation: async (root, args, ctx, info) => {
      let res = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${args.lat},${args.lng}&key=${OPENCAGE_KEY}`
      )
      let l = { town: null, city: null, state: null, zip: null }
      if (res.data.results[0]) {
        const r: any = res.data.results[0].components
        l.town = r.county
        l.zip = r.postcode
        l.state = r.state
        l.city = r.state_district
      }
      return l
    },
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
    addAddress: async (
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
        zip: string
        phone: string
        coords: { lat: number; lng: number }
      },
      { req }: { req: Request }
    ): Promise<AddressDocument> => {
      await validate(addressSchema, args)
      const { userId } = req.session
      const address = await Address.create({ ...args, uid: userId })
      await address.save()
      return address
    },
    updateAddress: async (
      root,
      args: {
        uid: string
        id: string
        email: string
        firstName: string
        lastName: string
        address: string
        town: string
        city: string
        country: string
        state: string
        zip: string
        phone: string
        coords: { lat: number; lng: number }
      },
      { req }: { req: Request }
    ): Promise<AddressDocument | null> => {
      await validate(addressSchema, args)
      const { userId } = req.session
      args.uid = userId
      const address = await Address.findOneAndUpdate({ _id: args.id }, args, {
        new: true
      })
      return address
    },
    deleteAddress: async (
      root,
      args: {
        id: string
      },
      { req }: { req: Request }
    ): Promise<Boolean> => {
      const { userId } = req.session
      const address = await Address.deleteOne({ _id: args.id, uid: userId })
      console.log('xxxxxxxxxxxxxxxxx', address)
      return address.deletedCount == 1
    }
  }
}

export default resolvers
