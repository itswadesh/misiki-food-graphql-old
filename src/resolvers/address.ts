import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import { Request, AddressDocument, UserDocument } from '../types'
import { validate, addressSchema, objectId } from '../validation'
import { Address, User } from '../models'
import { fields, hasSubfields } from '../utils'
import pubsub from '../pubsub'
import axios from 'axios'
const { OPENCAGE_KEY, GOOGLE_MAPS_KEY, MAPBOX_KEY } = process.env
const MESSAGE_SENT = 'MESSAGE_SENT'
const resolvers: IResolvers = {
  Query: {
    getLocation: async (root, args, ctx, info) => {
      try {
        let res = await axios.get(
          // `https://api.mapbox.com/geocoding/v5/mapbox.places/${args.lat},${args.lng}.json?access_token=${MAPBOX_KEY}`
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${args.lat},${args.lng}&sensor=true&key=${GOOGLE_MAPS_KEY}`
        )
        let l = {
          coords: { lat: 0, lng: 0 },
          town: null,
          city: null,
          district: null,
          state: null,
          country: null,
          zip: 0,
        }
        const result = res.data.results[0]
        if (!result) throw new UserInputError('Invalid google map key')
        const c = result.address_components
        const len = c.length
        l.coords = { lat: +args.lat, lng: +args.lng }
        l.zip = +c[len - 1].long_name
        l.country = c[len - 2].long_name
        l.state = c[len - 3].long_name
        l.district = c[len - 4].long_name
        l.city = c[len - 5].long_name
        return l
      } catch (e) {
        throw e
      }
    },
    addresses: (
      root,
      args,
      { req }: { req: Request },
      info
    ): Promise<AddressDocument[]> => {
      const { userId } = req.session
      return Address.find({ user: userId }, fields(info)).sort('-updatedAt').exec()
    },
    address: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<AddressDocument | null> => {
      await objectId.validateAsync(args)
      return Address.findById(args.id, fields(info))
    },
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
        district: string
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
      const address = await Address.create({ ...args, user: userId })
      await address.save()
      User.updateOne({ _id: userId }, { address })
      return address
    },
    saveAddress: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<AddressDocument | null> => {
      const { userId } = req.session
      args.user = userId
      if (args.id == 'new') return await Address.create(args)
      else {
        const address = await Address.findOneAndUpdate(
          { _id: args.id },
          args,
          { new: true, upsert: true }
        )
        await address.save() // To fire pre save hoook
        return address
      }
    },
    updateAddress: async (
      root,
      args: {
        user: string
        id: string
        email: string
        firstName: string
        lastName: string
        address: string
        town: string
        district: string
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
      args.user = userId
      const address: any = await Address.findOneAndUpdate(
        { _id: args.id },
        args,
        { new: true }
      )
      await User.updateOne(
        { _id: userId },
        {
          address: {
            firstName: address.firstName,
            lastName: address.lastName,
            address: address.address,
            town: address.town,
            city: address.city,
            state: address.state,
            zip: address.zip,
            country: address.country,
          },
        }
      )
      return address
    },
    deleteAddress: async (
      root,
      args: { id: string },
      { req }: { req: Request }
    ): Promise<Boolean> => {
      const { userId } = req.session
      const address = await Address.deleteOne({ _id: args.id, user: userId })
      return address.deletedCount == 1
    },
  },
}

export default resolvers
