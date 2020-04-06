import mongoose, { Schema } from 'mongoose'
import { MessageDocument } from '../types'

const { ObjectId } = Schema.Types

const messageSchema = new Schema(
  {
    body: String,
    user: { type: ObjectId, ref: 'User' },
  },
  { timestamps: true }
)
messageSchema.index({ '$**': 'text' });
export const Message = mongoose.model<MessageDocument>('Message', messageSchema)
