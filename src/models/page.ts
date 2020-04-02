import mongoose, { Schema } from 'mongoose'
import { PageDocument } from '../types'

const { ObjectId } = Schema.Types

const pageSchema = new Schema(
  {
    id: String,
    menuTitle: String,
    name: String,
    title: String,
    slug: String,
    description: String,
    content: String,
    q: String,
    email: String,
    uid: { type: ObjectId, ref: 'User' },
    status: { type: Boolean, default: true }
  },
  { versionKey: false, timestamps: true }
)
pageSchema.index({
  '$**': 'text'
});
export default mongoose.model<PageDocument>('Page', pageSchema)
