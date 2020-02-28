import { Document } from 'mongoose'
import { UserDocument, CouponDocument, ProductDocument } from './'

export interface CartDocument extends Document {
  body: string
  uid: UserDocument['_id']
  cart_id: CartDocument['_id']
  qty: number
  discount: CouponDocument['_id']
  subtotal: number
  shipping: object
  tax: object
  total: number
  offer_total: number
  items: [ProductDocument['_id']]
  vendor: UserDocument['_id']
  active: boolean
}
