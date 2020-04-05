import mongoose, { Schema } from 'mongoose'
import { CartDocument } from '../types'

const { ObjectId } = Schema.Types

const itemSchema = new Schema({
  pid: { type: ObjectId, ref: 'Product' },
  uid: { type: ObjectId, ref: 'User' },
  name: String,
  img: String,
  slug: String,
  price: Number,
  qty: Number,
  time: String
})

const cartSchema = new Schema(
  {
    uid: { type: ObjectId, ref: 'User' },
    cart_id: String,
    qty: Number,
    discount: Object,
    subtotal: Number,
    shipping: Object,
    tax: Object,
    total: Number,
    offer_total: Number,
    items: [itemSchema],
    vendor: { type: ObjectId, ref: 'User' },
    active: { type: Boolean, default: true }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export const Cart = mongoose.model<CartDocument>('Cart', cartSchema)
