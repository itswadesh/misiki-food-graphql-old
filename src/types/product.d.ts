import { Document } from 'mongoose'
import {
  UserDocument,
  CategoryDocument,
  BrandDocument,
  VariantDocument
} from './'

export interface ProductDocument extends Document {
  name: string
  slug: string
  sku: string
  group: string
  img: string
  enableZips: boolean
  zips: [string]
  category: CategoryDocument['_id']
  parentCategory: CategoryDocument['_id']
  categories: [CategoryDocument['_id']]
  description: string
  status: string
  type: string
  qty: number
  rate: number
  time: string
  daily: boolean
  features: string
  keyFeatures: [UserDocument['_id']]
  vendor: UserDocument['_id']
  active: boolean
  meta: object
  badge: object
  stats: object
  related: [ProductDocument['_id']]
}