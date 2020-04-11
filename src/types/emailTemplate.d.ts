import { Document } from 'mongoose'
import { UserDocument } from './'

export interface EmailTemplateDocument extends Document {
  id: string
  name: string
  slug: string
  title: string
  description: string
  content: string
  user: UserDocument['_id']
}
