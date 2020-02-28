import mongoose, { Schema } from 'mongoose'
import { OrderDocument } from '../types'

const { ObjectId } = Schema.Types

const orderSchema = new Schema(
  {
    uid: { type: ObjectId, ref: 'User' },
    orderNo: String,
    address: { type: ObjectId, ref: 'Address' }, // TODO: save full address object
    vendor: { type: ObjectId, ref: 'User' },
    cartId: String,
    payment: {
      type: Object,
      default: {
        method: 'COD',
        status: 'Pending',
        details: String,
        payment_order_id: String
      }
    },
    delivery: {
      type: Object,
      default: { received: 0, weight: 0, status: 'Pending' }
    },
    amount: {
      qty: Number,
      subtotal: Number,
      tax: Number,
      discount: Number,
      shipping: Number,
      total: Number,
      currency: String,
      exchange_rate: Number,
      offer: Object
    },
    items: [{ type: ObjectId, ref: 'Product' }],
    status: { type: String, default: 'Waiting for confirmation' },
    comment: String,
    cancellationReason: String,
    cancellationComment: String,
    returnComment: String,
    reviewed: { type: Boolean, default: false },
    otp: String,
    active: { type: Boolean, default: true }
  },
  { versionKey: false, timestamps: true }
)

export default mongoose.model<OrderDocument>('Order', orderSchema)
