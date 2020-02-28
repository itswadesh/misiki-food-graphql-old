import mongoose, { Schema } from 'mongoose'
import { BrandDocument } from '../types'

const brandSchema = new Schema(
  {
    name: String,
    slug: String,
    info: String,
    parent: String,
    img: String,
    banner: String,
    meta: String,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    uid: String,
    brand: Number,
    featured: { type: Boolean, default: false },
    sizechart: String,
    position: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default mongoose.model<BrandDocument>('Brand', brandSchema)
