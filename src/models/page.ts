import mongoose, { Schema } from 'mongoose'
import { PageDocument } from '../types'
import { generateSlug } from '../utils'

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
pageSchema.pre('save', async function(this: PageDocument) {
  if (!this.slug) this.slug = await generateSlug(this.name)
})
pageSchema.index({ '$**': 'text' })
export const Page = mongoose.model<PageDocument>('Page', pageSchema)
