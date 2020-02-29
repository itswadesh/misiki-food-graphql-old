import { Document } from 'mongoose'
import { UserDocument } from '.'

export interface PromotionDocument extends Document {
  name: string
  slug: string
  type: string
  platform: string
  condition: [string]
  productCondition: { type: string }
  action: { type: 'Fixed'; val: '0' }
  description: string
  img: string
  uid: UserDocument['_id']
  featured: boolean
  priority: number
  validFromDate: string
  validToDate: string
  active: boolean
}
