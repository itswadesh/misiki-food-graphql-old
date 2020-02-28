import { Document } from 'mongoose'
import { UserDocument, ChatDocument } from './'

export interface PageDocument extends Document {
  menuTitle: string
  name: string
  title: string
  slug: string
  description: string
  content: string
  uid: UserDocument['_id']
}
