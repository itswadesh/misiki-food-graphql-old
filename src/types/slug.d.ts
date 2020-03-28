import { Document } from 'mongoose'
import { UserDocument, ChatDocument } from './'

export interface SlugDocument extends Document {
  slug: string
  user: UserDocument['_id']
  q: string
}
