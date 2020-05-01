import { Document } from 'mongoose'
import {
  UserDocument,
  AddressDocument,
  CartDocument,
  ProductDocument,
  ChatDocument,
} from './'

export interface OrderDocument extends Document {
  uid: UserDocument['_id']
  orderNo: string
  amount: {
    qty: number
    subtotal: number
    tax: number
    discount: number
    shipping: number
    total: number
    currency: string
    exchange_rate: number
    offer: any
  }
  address: {
    email: string
    firstName: string
    lastName: string
    address: string
    town: string
    district: string
    city: string
    country: string
    state: string
    coords: { lat: number; lng: number }
    zip: number
    phone: string
    active: boolean
    uid: UserDocument['_id']
  }
  vendor: {
    restaurant: string
    id: UserDocument['_id']
  }
  payment_order_id: string
  cartId: CartDocument['_id']
  items: [ProductDocument['_id']]
  Status: string
  delivery: object
  comment: string
  cancellationReason: string
  cancellationComment: string
  returnComment: string
  payment: object
  reviewed: boolean
}
