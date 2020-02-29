import { Document, Model } from 'mongoose'
import { ChatDocument } from './'
import { AddressDocument } from './address'

export interface UserDocument extends Document {
  name: string
  phone: string
  email: string
  password: string
  matchesPassword: (password: string) => Promise<boolean>
  role: string
  gender: string
  info: InfoDocument
  avatar: string
  provider: string
  facebook: any
  twitter: any
  google: any
  github: any
  active: boolean
  verified: boolean
  address: AddressDocument
  meta: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
}

export interface UserModel extends Model<UserDocument> {
  hash: (password: string) => Promise<string>
}

export interface InfoDocument extends Document {
  popularity: Number
  avg_rating: Number
}
