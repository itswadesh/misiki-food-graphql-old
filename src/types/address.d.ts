import { Document } from 'mongoose'
import { UserDocument, ChatDocument } from './'

export interface AddressDocument extends Document {
  email: string
  firstName: string
  lastName: string
  address: string
  town: string
  city: string
  country: string
  state: string
  coords: object
  zip: number
  phone: string
  active: boolean
}
