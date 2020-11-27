import mongoose, { Schema } from 'mongoose'
import { OrderDocument } from '../types'

const { ObjectId } = Schema.Types

const orderSchema = new Schema(
  {
    user: { type: ObjectId, ref: 'User' },
    email: String,
    user_ref: String,
    phone: String,
    orderNo: String,
    address: {
      type: Object,
      default: { recipient_name: '', city: 'Sunabeda', country_code: 'India' }
    },
    payment: {
      type: Object,
      default: { method: 'COD', status: 'Pending', details: '' }
    },
    shipping: {
      type: Object,
      default: {
        method: 'Standard Delivery',
        amount: 0,
        status: 'Pending',
        weight: 0,
        qty: 0
      }
    },
    amount: {
      total: Number,
      subtotal: Number,
      discount: Number,
      shipping: Number,
      qty: Number,
      tax: Number,
      currency: String,
      exchange_rate: Number,
      offer: Object
    },
    items: [
      {
        name: String,
        sku: String,
        pid: { type: ObjectId, ref: 'Product' },
        slug: String,
        description: String,
        vid: String,
        variant_sku: String,
        size: String,
        color: String,
        img: Object,
        mrp: Number,
        price: Number,
        discount: Number,
        qty: Number,
        currency: String,
        url: String,
        status: { type: String, default: 'Placed' },
        comment: String,
        vendor_id: String,
        vendor_email: String,
        vendor_name: String,
        delivery_days: Number
      }
    ],
    status: { type: String, default: 'Received' },
    comment: String,
    cancellationReason: String,
    cancellationComment: String,
    returnComment: String,
    platform: { type: String, default: 'website' },
    otp: String,
    active: { type: Boolean, default: true },
    q: String
  },
  { versionKey: false, timestamps: true }
)

export const FashionOrder = mongoose.model<OrderDocument>('Order', orderSchema)
