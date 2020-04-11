import mongoose, { Schema } from 'mongoose'
import { PromotionDocument } from '../types'

const promotionSchema = new Schema(
  {
    name: String,
    slug: String,
    type: { type: String, default: 'product' },
    platform: { type: String, default: 'Website' },
    condition: { type: Array, default: [] },
    productCondition: { type: String },
    action: { type: Object, default: { type: 'Fixed', val: '0' } },
    description: String,
    img: String,
    uid: String,
    featured: Boolean,
    priority: Number,
    validFromDate: { type: Date, default: Date.now() },
    validToDate: {
      type: Date,
      default: () => Date.now() + 24 * 60 * 60 * 1000
    },
    q: String,
    active: { type: Boolean, default: true }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export const Promotion = mongoose.model<PromotionDocument>(
  'Promotion',
  promotionSchema
)
