import mongoose, { Schema } from 'mongoose'
import { WishlistDocument } from '../types'

const { ObjectId } = Schema.Types

const wishlistSchema = new Schema(
  {
    product: {
      _id: ObjectId,
      name: String,
      slug: String,
      img: [],
      keyFeatures: [],
      vendor_email: String,
      vendor_name: String,
      vendor_id: String
    },
    variant: {
      _id: ObjectId,
      size: String,
      color: String,
      weight: String,
      price: Number,
      mrp: Number,
      img: Object
    },
    uid: { type: ObjectId, ref: 'User' },
    q: String,
    email: String,
    status: { type: Boolean, default: true }
  },
  { versionKey: false, timestamps: true }
)
wishlistSchema.index({
  '$**': 'text'
});
export const Wishlist = mongoose.model<WishlistDocument>('Wishlist', wishlistSchema)
