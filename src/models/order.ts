import mongoose, { Schema } from 'mongoose'
import { OrderDocument } from '../types'

const { ObjectId } = Schema.Types

const orderSchema = new Schema(
  {
    uid: { type: ObjectId, ref: 'User' },
    orderNo: String,
    address: {
      email: String,
      firstName: String,
      lastName: String,
      address: String,
      town: String,
      city: String,
      country: String,
      state: String,
      coords: { lat: Number, lng: Number },
      zip: Number,
      phone: String,
      active: { type: Boolean, default: true },
      uid: { type: ObjectId, ref: 'User' }
    },
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
    items: [
      {
        pid: {
          type: ObjectId,
          ref: 'Product'
        },
        name: String,
        sku: String,
        slug: String,
        description: String,
        img: String,
        qty: Number,
        rate: Number,
        subtotal: Number,
        total: Number,
        currency: String,
        vendor: {
          type: ObjectId,
          ref: 'User'
        },
        delivery_days: Number
      }
    ],
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
