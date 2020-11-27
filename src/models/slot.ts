import mongoose, { Schema } from 'mongoose'
import { SlotDocument } from '../types'
import { generateSlug } from '../utils'

const { ObjectId } = Schema.Types

const slotSchema = new Schema(
  {
    name: { type: String, required: true },
    val: String,
    slug: String,
    info: String,
    user: { type: ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
    q: String
  },
  {
    timestamps: true
  }
)

slotSchema.pre('save', async function(this: SlotDocument) {
  if (!this.slug) {
    this.slug = await generateSlug(this.name)
  }
  this.q = this.name ? this.name.toLowerCase() + ' ' : ''
  this.q += this.val ? this.val.toLowerCase() + ' ' : ''
  this.q += this.active ? this.active + ' ' : ''
  this.q = this.q.trim()
})
slotSchema.index({
  '$**': 'text'
})
export const Slot = mongoose.model<SlotDocument>('Slot', slotSchema)
