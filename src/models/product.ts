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
    stock: Number,
    rate: Number,
    time: String,
    daily: { type: Boolean, default: false },
    meta: String,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    features: [{ key: String, val: String }],
    featured: { type: Boolean, default: false },
    position: Number,
    keyFeatures: [String],
    popularity: Number,
    uid: { type: ObjectId, ref: 'User' },
    vendor: { type: ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
    approved: { type: Boolean, default: true },
    recommended: { type: Boolean, default: false },
    hot: { type: Boolean, default: false },
    sale: { type: Boolean, default: false },
    new: { type: Boolean, default: false },
    ratings: { type: Number },
    reviews: { type: Number },
    sales: { type: Number },
    related: { type: ObjectId, ref: 'Product' }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default mongoose.model<ProductDocument>('Product', productSchema)
