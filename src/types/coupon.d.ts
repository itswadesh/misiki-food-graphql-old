import { Document } from 'mongoose'

export interface CouponDocument extends Document {
  code: string
  value: number
  type: string
  info: string
  msg: string
  text: string
  terms: string
  minimumCartValue: number
  maxAmount: number
  validFromDate: Date
  validToDate: Date
  amount: number
  active: boolean
  q: string
  color: string
}
