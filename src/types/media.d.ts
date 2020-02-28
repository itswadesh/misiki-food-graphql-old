import { Document } from 'mongoose'
import { UserDocument } from './'

export interface MediaDocument extends Document {
  originalFilename: string
  src: string
  path: object
  size: string
  type: string
  name: string
  uid: UserDocument['_id']
  use: string
}
