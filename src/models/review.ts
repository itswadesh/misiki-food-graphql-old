import mongoose, { Schema } from 'mongoose'
import { ReviewDocument } from '../types'
const { ObjectId } = Schema.Types
const reviewSchema = new Schema(
  {
    pid: { type: ObjectId, ref: 'Product' },
    vid: { type: ObjectId, ref: 'Variant' },
    uid: { type: ObjectId, ref: 'User' },
    rating: Number,
    message: String,
    active: { type: Boolean, default: true },
    q: String
  },
  { versionKey: false, timestamps: true }
)

export default mongoose.model<ReviewDocument>('Review', reviewSchema)
