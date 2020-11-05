import { IResolvers, UserInputError } from 'apollo-server-express'
import { Request, CouponDocument } from '../types'
import { validate, objectId, couponSchema } from '../validation'
import { Coupon, User } from '../models'
import { fields, calculateSummary, index, validateCart } from '../utils'
import { Types } from 'mongoose'

const resolvers: IResolvers = {
  Query: {
    couponsAdmin: async (root:any, args:any, { req }: { req: Request }, info) => {
      return index({ model: Coupon, args, info })
    },
    coupons: async (root:any, args:any, { req }: { req: Request }, info) => {
      args.active = true
      args.validFromDate = { $lte: new Date() }
      args.validToDate = { $gte: new Date() }
      return index({ model: Coupon, args, info })
    },
    coupon: async (
      root:any,
      args: { id: string },
      ctx,
      info
    ): Promise<CouponDocument | null> => {
      await objectId.validateAsync(args)
      return Coupon.findById(args.id, fields(info))
    }
  },
  Mutation: {
    applyCoupon: async (
      root:any,
      args:any,
      { req }: { req: Request }
    ): Promise<any> => {
      await calculateSummary(req, args.code)
      return req.session.cart
    },
    removeCoupon: async (
      root:any,
      args:any,
      { req }: { req: Request }
    ): Promise<any> => {
      await calculateSummary(req)
      return req.session.cart
    },
    saveCoupon: async (
      root:any,
      args:any,
      { req }: { req: Request }
    ): Promise<CouponDocument | null> => {
      const { userId } = req.session
      if (args.id == 'new') delete args.id
      const coupon = await Coupon.findOneAndUpdate(
        { _id: args.id || Types.ObjectId() },
        { ...args, user: userId },
        { new: true, upsert: true }
      )
      await coupon.save() // To fire pre save hoook
      return coupon
    },
    createCoupon: async (
      root:any,
      args: {
        code: string
        value: number
        type: string
        info: string
        msg: string
        text: string
        terms: string
        minimumCartValue: number
        maxAmount: number
        from: string
        to: string
        user: string
        active: boolean
      },
      { req }: { req: Request }
    ): Promise<CouponDocument> => {
      await validate(couponSchema, args)
      const { userId } = req.session
      args.user = userId
      const coupon = new Coupon(args)
      await coupon.save()
      return coupon
    }
  }
}

export default resolvers
