import mongoose, { Schema } from 'mongoose'
import { CartDocument } from '../types'

const { ObjectId } = Schema.Types

const cartSchema = new Schema(
  {
    uid: { type: ObjectId, ref: 'User' },
    cart_id: String,
    phone: String,
    email: String,
    qty: Number,
    discount: Object,
    subtotal: Number,
    shipping: Object,
    tax: Object,
    total: Number,
    offer_total: Number,
    items: Array,
    vendor: { type: ObjectId, ref: 'User' },
    vendor_name: String,
    restaurant: String,
    q: String,
    active: { type: Boolean, default: true }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default mongoose.model<CartDocument>('Cart', cartSchema)
