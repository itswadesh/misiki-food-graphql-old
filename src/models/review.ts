import mongoose, { Schema } from 'mongoose'
import { ReviewDocument } from '../types'
const { ObjectId } = Schema.Types
const reviewSchema = new Schema(
  {
    product: { type: ObjectId, ref: 'Product' },
    variant: { type: ObjectId, ref: 'Variant' },
    user: { type: ObjectId, ref: 'User' },
    rating: Number,
    message: String,
    active: { type: Boolean, default: true },
    q: String
  },
  { versionKey: false, timestamps: true }
)

reviewSchema.pre('save', async function (this: ReviewDocument) {
  this.q = this.message ? this.message.toLowerCase() + " " : "";
  this.q += this.active ? this.active + " " : "";
  this.q = this.q.trim()
})
reviewSchema.index({
  '$**': 'text'
});
export const Review = mongoose.model<ReviewDocument>('Review', reviewSchema)
