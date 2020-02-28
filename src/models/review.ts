import mongoose, { Schema } from 'mongoose'
import { ReviewDocument } from '../types'

const { ObjectId } = Schema.Types

const reviewSchema = new Schema(
  {
    pid: ObjectId,
    pname: String,
    pslug: String,
    avatar: String,
    size: String,
    reviewer: String, // Required as we are not joining with the User table
    uid: String,
    email: String, // Required as we are not joining with the User table
    phone: String, // Required as we are not joining with the User table
    vendor_id: { type: ObjectId, ref: 'User' },
    vendor_name: String, // This will avoid multiple table join while populating all reviews for a particular vendor
    vendor_phone: String, // This will avoid multiple table join while populating all reviews for a particular vendor
    firstName: String,
    lastName: String,
    message: String,
    votes: {
      count: { type: Number, default: 0 },
      voters: [{ uid: { type: ObjectId, ref: 'User' }, vote: Number }]
    },
    rating: { type: Number, default: 0 },
    q: String,
    active: { type: Boolean, default: true }
  },
  { versionKey: false, timestamps: true }
)

export default mongoose.model<ReviewDocument>('Review', reviewSchema)
