import { Document } from 'mongoose'

export interface StateDocument extends Document {
  id: string
  name: string
  slug: string
  value: string
  img: string
  flag: string
  language: string
  sort: number
  active: boolean
  q: string
}
