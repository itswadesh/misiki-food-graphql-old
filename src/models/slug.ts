import mongoose, { Schema } from 'mongoose'
import { SlugDocument } from '../types'

const { ObjectId } = Schema.Types

const slugSchema = new Schema(
  {
    slug: String,
    user: { type: ObjectId, ref: 'User' },
    q: String
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export const Slug = mongoose.model<SlugDocument>('Slug', slugSchema)
