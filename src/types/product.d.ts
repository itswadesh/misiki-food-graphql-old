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
  stock: number
  price: number
  time: string
  daily: boolean
  features: string
  keyFeatures: [UserDocument['_id']]
  vendor: UserDocument['_id']
  active: boolean
  delivery_days: number
  meta: {
    info: string
    title: string
    description: string
    keywords: string
  }
  badge: {
    recommended: boolean
    hot: boolean
    sale: boolean
    new: boolean
    featured: boolean
    approved: boolean
  }
  stats: {
    position: number
    popularity: number
    sales: number
    ratings: number
    reviews: number
  }
  related: [ProductDocument['_id']],
  q: string
}
