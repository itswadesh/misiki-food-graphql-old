import mongoose, { Schema } from 'mongoose'
import { SlotDocument } from '../types'

const { ObjectId } = Schema.Types

const slotSchema = new Schema(
  {
    body: String,
    sender: {
      type: ObjectId,
      ref: 'User'
    },
    chat: {
      type: ObjectId,
      ref: 'Chat'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<SlotDocument>('Slot', slotSchema)
