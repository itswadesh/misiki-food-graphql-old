import { Document } from 'mongoose'
import { UserDocument, ChatDocument } from './'

export interface ReviewDocument extends Document {
  body: string
  sender: UserDocument['_id']
  chat: ChatDocument['_id']
}
