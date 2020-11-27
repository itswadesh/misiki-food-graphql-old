import { Document } from 'mongoose'
import { UserDocument } from './'

export interface CategoryDocument extends Document {
  index: number
  name: string
  parent: string
  slug: string
  pid: string
  path: string
  slugPath: string
  namePath: string
  pathA: [string]
  slugPathA: [string]
  namePathA: [string]
  level: number
  position: number
  megamenu: boolean
  meta: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  img: string
  featured: boolean
  active: boolean
  shopbycategory: boolean
  children: CategoryDocument['_id']
  uid: UserDocument['_id']
  count: number
  sizechart: string
  q: string
}
