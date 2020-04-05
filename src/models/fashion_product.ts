import mongoose, { Schema } from 'mongoose'
import { ProductDocument } from '../types'

const { ObjectId } = Schema.Types

const variantsSchema = new Schema({
  img: [],
  imgUrls: { type: Array, default: [] },
  price: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  size: String,
  color: String,
  trackInventory: { type: Boolean, default: false },
  stock: { type: Number, default: 100000 },
  unit: { type: String, default: 'KG' },
  weight: { type: Number, default: 0 },
  sku: String,
  barcode: String,
  sameImages: Boolean,
  active: { type: Boolean, default: true },
  enableUnitPrice: { type: Boolean, default: false },
  saleFromDate: { type: Date, default: Date.now },
  saleToDate: {
    type: Date,
    default: () => Date.now() + 1 * 365 * 24 * 60 * 60 * 1000
  }
})

let productSchema = new mongoose.Schema(
  {
    sku: String,
    group: String,
    name: String,
    nameLower: String,
    slug: String,
    img: { type: Array, default: [] },
    imgUrls: { type: Array, default: [] },
    enableZips: { type: Boolean, default: false },
    zips: [{ type: Number }],
    category: { type: ObjectId, ref: 'Category' },
    parentCategory: { type: ObjectId, ref: 'Category' },
    cat: {},
    categories: [{ type: ObjectId, ref: 'Category' }],
    status: String,
    brand: { type: ObjectId, ref: 'Brand' },
    brandName: String,
    brandSlug: String,
    description: String,
    meta: String,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    variants: [variantsSchema],
    features: [{ key: String, val: String }],
    featured: { type: Boolean, default: false },
    position: { type: Number, default: 0 },
    keyFeatures: Array,
    popularity: { type: Number, default: 0 },
    uid: String, // can not use ObjectId for join(as of Category) as we store email here
    vendor_id: { type: ObjectId, ref: 'User' },
    vendor_name: String, // Store vendor name here
    vendor_email: String, // can not use ObjectId for join(as of Category) as we store vendor email here
    updated: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    approved: { type: Boolean, default: true },
    hot: { type: Boolean, default: false },
    sale: { type: Boolean, default: false },
    q: String,
    q1: String,
    new: { type: Boolean, default: false },
    related: [{ type: ObjectId, ref: 'Product' }],
    sizechart: Object,
    validFromDate: { type: Date, default: Date.now },
    validToDate: {
      type: Date,
      default: () => Date.now() + 20 * 365 * 24 * 60 * 60 * 1000
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export const FashionProduct = mongoose.model<ProductDocument>('Product', productSchema)
