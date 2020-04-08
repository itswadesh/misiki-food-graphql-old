import mongoose, { Schema } from 'mongoose'
import { CouponDocument } from '../types'

const { ObjectId } = Schema.Types

const couponSchema = new Schema(
  {
    code: String,
    value: Number,
    type: { type: String, default: 'Discount' },
    active: { type: Boolean, default: false },
    info: String,
    msg: String,
    text: String,
    terms: String,
    minimumCartValue: Number,
    amount: Number,
    maxAmount: Number,
    validFromDate: Date,
    validToDate: Date,
    color: String,
    q: String
  },
  {
    versionKey: false,
    timestamps: true
  }
)

couponSchema.pre('save', async function (this: CouponDocument) {
  this.q = this.code ? this.code + " " : "";
  this.q += this.value ? this.value + " " : "";
  this.q += this.type ? this.type.toLowerCase() + " " : "";
  this.q += this.info ? this.info.toLowerCase() + " " : "";
  this.q += this.msg ? this.msg.toLowerCase() + " " : "";
  this.q += this.text ? this.text.toLowerCase() + " " : "";
  this.q += this.terms ? this.terms.toLowerCase() + " " : "";
  this.q += this.color ? this.color.toLowerCase() + " " : "";
  this.q += this.active ? this.active + " " : "";
  this.q = this.q.trim()
})
couponSchema.index({
  '$**': 'text'
});
export const Coupon = mongoose.model<CouponDocument>('Coupon', couponSchema)
