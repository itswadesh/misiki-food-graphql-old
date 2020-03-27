import mongoose, { Schema } from 'mongoose'
import { ProductDocument } from '../types'
import { generateSlug } from '../utils'

const { ObjectId } = Schema.Types

let variantsSchema = new Schema({
  img: [String], imgUrls: [String], price: { type: Number, default: 0, es_indexed: true }, mrp: { type: Number, default: 0, es_indexed: true }, offer: { type: Number, default: 0 }, shipping: { type: Number, default: 0 },
  weight: String, name: { type: String, es_indexed: true }, color: String, trackInventory: { type: Boolean, default: false }, stock: { type: Number, default: 100000 }, unit: { type: String, default: 'None' }, sku: String,
  barcode: String, sameImages: Boolean, active: { type: Boolean, default: true }, enableUnitPrice: { type: Boolean, default: false },
  saleFromDate: { type: Date, default: Date.now },
  saleToDate: { type: Date, default: () => Date.now() + 1 * 365 * 24 * 60 * 60 * 1000 },
  sort: Number
});

let productSchema = new Schema(
  {
    name: String,
    slug: String,
    sku: String,
    group: String,
    img: String,
    enableZips: Boolean,
    variants: { type: [variantsSchema] },
    zips: [String],
    category: { type: ObjectId, ref: 'Category' },
    parentCategory: { type: ObjectId, ref: 'Category' },
    categories: [{ type: ObjectId, ref: 'Category' }],
    description: String,
    status: String,
    type: String,
    stock: Number,
    price: Number,
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
  this.q = this.name ? this.name.toLowerCase() + " " : "";
  this.q += this.description ? this.description.toLowerCase() + " " : "";
  // this.q += this.category ? this.category.toLowerCase() + " " : "";
  this.q += this.status ? this.status.toLowerCase() + " " : "";
  this.q += " ";
  this.q = this.q.trim()
})

export default mongoose.model<ProductDocument>('Product', productSchema)
