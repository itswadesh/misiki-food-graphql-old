import mongoose, { Schema } from 'mongoose'
import { OrderDocument } from '../types'

const { ObjectId } = Schema.Types

const orderSchema = new Schema(
  {
    orderNo: String,
    cartId: String,
    user: {
      firstName: String,
      lastName: String,
      address: Object,
      phone: String,
      id: { type: ObjectId, ref: 'User' },
    },
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
    payment: {
      type: Object,
      default: {
        method: 'COD',
        status: 'Pending',
        details: String,
        payment_order_id: String
      }
    },
    amount: {
      qty: Number,
      subtotal: Number,
      tax: { cgst: Number, sgst: Number, igst: Number },
      discount: Number,
      shipping: Number,
      total: Number,
      currency: String,
      exchange_rate: Number,
      offer: Object
    },
    coupon: Object,
    items: [
      {
        pid: { type: ObjectId, ref: 'Product' },
        name: String,
        sku: String,
        slug: String,
        description: String,
        img: String,
        qty: Number,
        price: Number,
        time: String,
        subtotal: Number,
        total: Number,
        currency: String,
        reviewed: { type: Boolean, default: false },
        vendor: {
          restaurant: String,
          address: Object,
          phone: String,
          firstName: String,
          lastName: String,
          id: { type: ObjectId, ref: 'User' },
        },
        delivery: { type: Object, default: { days: 1, received: 0, weight: 0, status: 'Pending' } },
        status: { type: String, default: 'Waiting for confirmation' },
      }
    ],
    comment: String,
    cancellationReason: String,
    cancellationComment: String,
    returnComment: String,
    active: { type: Boolean, default: true },
    payment_order_id: String,
    cod_paid: Number
  },
  { versionKey: false, timestamps: true }
)
orderSchema.index({
  '$**': 'text'
});
export const Order = mongoose.model<OrderDocument>('Order', orderSchema)
