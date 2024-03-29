import mongoose, { Schema } from 'mongoose'
import { BrandDocument } from '../types'

const { ObjectId } = Schema.Types

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
    user: { type: ObjectId, ref: 'User' },
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

brandSchema.pre('save', async function(this: BrandDocument) {
  this.q = this.name ? this.name.toLowerCase() + ' ' : ''
  this.q += this.info ? this.info.toLowerCase() + ' ' : ''
  this.q += this.parent ? this.parent.toLowerCase() + ' ' : ''
  this.q += this.img ? this.img.toLowerCase() + ' ' : ''
  this.q += this.banner ? this.banner.toLowerCase() + ' ' : ''
  this.q = this.q.trim()
})
brandSchema.index({
  '$**': 'text'
})
export const Brand = mongoose.model<BrandDocument>('Brand', brandSchema)
