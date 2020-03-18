import { Document } from 'mongoose'
import { UserDocument, CouponDocument, ProductDocument } from './'
import { VariantDocument } from './variant'

export interface CartDocument extends Document {
  body: string
  uid: UserDocument['_id']
  cart_id: CartDocument['_id']
  price: number
  qty: number
  discount: CouponDocument['_id']
  subtotal: number
  shipping: object
  tax: object
  total: number
  offer_total: number
  items: [CartItemDocument['_id']]
  vendor: UserDocument['_id']
  active: boolean
}

export interface CartItemDocument extends Document {
  pid: ProductDocument['_id']
  vid: VariantDocument['_id']
  name: string
  sku: string
  slug: string
  description: string
  img: string
  qty: number
  price: number
  subtotal: number
  total: number
  currency: string
  vendor: UserDocument['_id']
  delivery_days: number
}
