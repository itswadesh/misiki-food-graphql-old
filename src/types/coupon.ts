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
  from: string
  to: string
  active: boolean
}
