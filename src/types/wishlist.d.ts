import { Document } from 'mongoose'
import { ProductDocument, UserDocument, VariantDocument } from './'

export interface WishlistDocument extends Document {
  user: UserDocument['_id']
  product: ProductDocument['_id']
  variant: VariantDocument['_id']
  q: String
}
