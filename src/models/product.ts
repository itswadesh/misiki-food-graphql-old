import mongoose, { Schema } from 'mongoose'
import { ProductDocument } from '../types'
import { generateSlug } from '../utils'

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
    related: { type: ObjectId, ref: 'Product' },
    q: String
  },
  {
    versionKey: false,
    timestamps: true
  }
)

productSchema.pre('save', async function (this: ProductDocument) {
  if (!this.slug) {
    this.slug = await generateSlug(this.name)
  }
  this.q = this.sku ? this.sku + " " : "";
  this.q = this.name ? this.name.toLocaleLowerCase() + " " : "";
  this.q += this.description ? this.description.toLocaleLowerCase() + " " : "";
  this.q += this.category ? this.category.toLocaleLowerCase() + " " : "";
  this.q += this.status ? this.status.toLocaleLowerCase() + " " : "";
  this.q += " ";
  this.q = this.q.trim()
})

export default mongoose.model<ProductDocument>('Product', productSchema)
