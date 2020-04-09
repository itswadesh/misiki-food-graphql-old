import { Document } from 'mongoose'
import { UserDocument } from './'

export interface CityDocument extends Document {
  name: string
  lat: number
  lng: number
  user: UserDocument['_id']
}
