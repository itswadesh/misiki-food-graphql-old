import { Document } from 'mongoose'
import { UserDocument, ChatDocument } from './'

export interface MessageDocument extends Document {
  body: string
  user: UserDocument['_id']
}
