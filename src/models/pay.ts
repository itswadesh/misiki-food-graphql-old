import mongoose, { Schema } from 'mongoose'
import { PayDocument } from '../types'

const { ObjectId } = Schema.Types

const paySchema = new Schema(
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

export default mongoose.model<PayDocument>('Pay', paySchema)
