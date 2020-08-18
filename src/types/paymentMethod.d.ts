import { Document } from 'mongoose'

export interface PaymentMethodDocument extends Document {
  name: string
  value: string
  img: string
  color: string
  key: string
  sort: number
  text: string
  active: boolean
}
