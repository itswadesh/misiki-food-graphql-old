import { Document } from 'mongoose'
import { UserDocument, ChatDocument } from './'

export interface PayDocument extends Document {
  id: string,
  entity: string,
  amount: number,
  currency: string,
  status: string,
  order_id: string,
  invoice_id: string,
  international: boolean,
  method: string,
  amount_refunded: number,
  refund_status: string,
  captured: boolean,
  description: string,
  card_id: string,
  bank: string,
  wallet: string,
  vpa: string,
  email: string,
  contact: string,
  fee: number,
  tax: number,
  error_code: string,
  error_description: string,
  created_at: string
}
