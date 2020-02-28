import { Document } from 'mongoose'
import { UserDocument, ChatDocument } from './'

export interface PayDocument extends Document {
  body: string
  sender: UserDocument['_id']
  chat: ChatDocument['_id']
}
