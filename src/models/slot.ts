import mongoose, { Schema } from 'mongoose'
import { SlotDocument } from '../types'

const { ObjectId } = Schema.Types

const slotSchema = new Schema(
  {
    name: { type: String, required: true },
    val: String,
    slug: String,
    info: String,
    uid: { type: ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
    q: String
  },
  {
    timestamps: true
  }
)

slotSchema.pre('save', async function (this: SlotDocument) {
  this.q = this.name ? this.name.toLowerCase() + " " : "";
  this.q += this.val ? this.val.toLowerCase() + " " : "";
  this.q += this.active ? this.active + " " : "";
  this.q = this.q.trim()
})

export default mongoose.model<SlotDocument>('Slot', slotSchema)
