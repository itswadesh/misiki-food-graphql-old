import { IResolvers } from 'apollo-server-express'
import { Request, CouponDocument } from '../types'
import { validate, objectId, couponSchema } from '../validation'
import { Coupon } from '../models'
import { fields, calculateSummary } from '../utils'

const resolvers: IResolvers = {
  Query: {
    coupons: (root, args, ctx, info): Promise<CouponDocument[]> => {
      return Coupon.find({}, fields(info)).exec()
    },
    coupon: async (
      root,
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
      root,
      args,
      { req }: { req: Request }
    ): Promise<any> => {
      await calculateSummary(req, args.code)
      return req.session.cart
    },
    updateCoupon: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<CouponDocument> => {
      const { userId } = req.session
      const coupon = await Coupon.updateOne(
        { _id: args.id },
        { ...args, uid: userId }
      )
      return coupon
    },
    createCoupon: async (
      root,
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
        active: boolean
      },
      { req }: { req: Request }
    ): Promise<CouponDocument> => {
      await validate(couponSchema, args)
      const { userId } = req.session
      const coupon = await Coupon.create({ ...args, uid: userId })
      await coupon.save()
      return coupon
    }
  }
}

export default resolvers
