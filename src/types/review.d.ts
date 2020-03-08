import { Document } from 'mongoose'
import { UserDocument, ChatDocument, ProductDocument, VariantDocument } from './'

export interface ReviewDocument extends Document {
  pid: ProductDocument['_id']
  vid: VariantDocument['_id']
  uid: UserDocument['_id']
  rating: number
  message: string
  q: string,
  active: boolean
}
