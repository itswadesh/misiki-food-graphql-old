import mongoose, { Schema } from 'mongoose'
import { PaymentMethodDocument } from '../types'

const paymentMethodSchema = new Schema(
  {
    name: String,
    value: String,
    img: String,
    color: String,
    key: String,
    position: Number,
    text: String,
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

paymentMethodSchema.index({
  '$**': 'text',
})
export const PaymentMethod = mongoose.model<PaymentMethodDocument>(
  'PaymentMethod',
  paymentMethodSchema
)
