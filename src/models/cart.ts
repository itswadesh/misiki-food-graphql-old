import mongoose, { Schema } from 'mongoose'
import { CartDocument } from '../types'

const { ObjectId } = Schema.Types

const itemSchema = new Schema({
  id: { type: ObjectId, ref: 'Product' },
  name: String,
  img: String,
  slug: String,
  rate: Number,
  qty: Number
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

export default mongoose.model<CartDocument>('Cart', cartSchema)