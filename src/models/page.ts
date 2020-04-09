import mongoose, { Schema } from 'mongoose'
import { PageDocument } from '../types'

const { ObjectId } = Schema.Types

const pageSchema = new Schema(
  {
    name: String,
    title: String,
    slug: String,
    description: String,
    content: String,
    menuTitle: String,
    user: { type: ObjectId, ref: 'User' },
    q: String,
    active: { type: Boolean, default: true }
  },
  { versionKey: false, timestamps: true }
)
pageSchema.index({
  '$**': 'text'
});
export const Page = mongoose.model<PageDocument>('Page', pageSchema)
