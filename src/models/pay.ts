import mongoose, { Schema } from 'mongoose'
import { PayDocument } from '../types'

const { ObjectId } = Schema.Types

const paySchema = new Schema(
  {
    id: String,
    entity: String,
    amount: Number,
    amount_paid: Number,
    amount_due: Number,
    currency: String,
    receipt: String,
    offer_id: String,
    status: String,
    attempts: Number,
    created_at: Date
  },
  {
    timestamps: true
  }
)

export default mongoose.model<PayDocument>('Pay', paySchema)
