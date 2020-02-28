import { Document } from 'mongoose'
import {
  UserDocument,
  CategoryDocument,
  BrandDocument,
  VariantDocument
} from './'

export interface ProductDocument extends Document {
  sku: string
  group: string
  name: string
  slug: string
  img: [string]
  enableZips: boolean
  zips: [string]
  category: CategoryDocument['_id']
  parentCategory: CategoryDocument['_id']
  categories: [CategoryDocument['_id']]
  status: string
  brand: BrandDocument['_id']
  description: string
  meta: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  variants: [VariantDocument['_id']]
  features: string
  position: Number
  keyFeatures: [UserDocument['_id']]
  popularity: Number
  uid: UserDocument['_id']
  active: string
  featured: boolean
  approved: boolean
  hot: boolean
  sale: boolean
  new: boolean
  related: [ProductDocument['_id']]
  sizechart: string
}
