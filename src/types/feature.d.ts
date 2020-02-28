import { Document } from 'mongoose'
import { CategoryDocument } from '.'

export interface FeatureDocument extends Document {
  name: string
  options: object
  key: string
  val: string
  categories: [CategoryDocument['_id']]
  position: number
  info: string
  slug: string
  active: boolean
  isFilter: boolean
}
