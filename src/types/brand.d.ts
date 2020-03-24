import { Document } from 'mongoose'
import { UserDocument } from '.'

export interface BrandDocument extends Document {
  name: string
  slug: string
  info: string
  parent: string
  img: string
  banner: string
  meta: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  uid: UserDocument['_id']
  featured: boolean
  sizechart: string
  position: number
  active: boolean
  q: string
}
