import mongoose, { Schema } from 'mongoose'
import { ProductDocument } from '../types'

const { ObjectId } = Schema.Types

let productSchema = new Schema(
  {
    name: String,
    slug: String,
    sku: String,
    group: String,
    img: String,
    enableZips: Boolean,
    zips: [String],
    category: { type: ObjectId, ref: 'Category' },
    parentCategory: { type: ObjectId, ref: 'Category' },
    categories: [{ type: ObjectId, ref: 'Category' }],
    description: String,
    status: String,
    type: String,
    qty: Number,
    rate: Number,
    time: String,
    daily: Boolean,
    features: [{ key: String, val: String }],
    keyFeatures: [String],
    vendor: { type: ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
    meta: {
      info: String,
      title: String,
      description: String,
      keywords: String
    },
    badge: {
      recommended: Boolean,
      hot: Boolean,
      sale: Boolean,
      new: Boolean,
      featured: Boolean,
      approved: Boolean
    },
    stats: {
      position: Number,
      popularity: Number,
      sales: Number,
      ratings: Number,
      reviews: Number
    },
    related: { type: ObjectId, ref: 'Product' }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default mongoose.model<ProductDocument>('Product', productSchema)
