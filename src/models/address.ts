import mongoose, { Schema } from 'mongoose'
import { AddressDocument } from '../types'

const { ObjectId } = Schema.Types

const addressSchema = new Schema(
  {
    email: String,
    firstName: String,
    lastName: String,
    address: String,
    town: String,
    city: String,
    country: String,
    state: String,
    coords: { lat: Number, lng: Number },
    zip: String,
    phone: String,
    active: { type: Boolean, default: true },
    uid: { type: ObjectId, ref: 'User' }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default mongoose.model<AddressDocument>('Address', addressSchema)
