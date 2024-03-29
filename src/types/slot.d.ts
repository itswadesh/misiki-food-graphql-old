import { Document } from 'mongoose'
import { UserDocument, ChatDocument } from './'

export interface SlotDocument extends Document {
  name: string
  val: string
  slug: string
  info: string
  active: boolean
  user: ChatDocument['_id']
  q: string
}
