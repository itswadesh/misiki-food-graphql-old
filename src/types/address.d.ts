import { Document } from 'mongoose'

export interface AddressDocument extends Document {
  email: string
  firstName: string
  lastName: string
  address: string
  town: string
  district: string
  city: string
  country: string
  state: string
  coords: { lat: number; lng: number }
  zip: number
  phone: string
  active: boolean
}
