import mongoose, { Schema } from 'mongoose'
import { CouponDocument } from '../types'

const { ObjectId } = Schema.Types

const couponSchema = new Schema(
  {
    code: String,
    value: Number,
    type: { type: String, default: 'Discount' },
    active: { type: Boolean, default: true },
    info: String,
    msg: String,
    text: String,
    terms: String,
    minimumCartValue: Number,
    maxAmount: Number,
    from: Date,
    to: Date,
    q: String
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default mongoose.model<CouponDocument>('Coupon', couponSchema)
