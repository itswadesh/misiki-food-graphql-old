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
    district: String,
    country: String,
    state: String,
    coords: { lat: Number, lng: Number },
    zip: Number,
    phone: String,
    active: { type: Boolean, default: true },
    user: { type: ObjectId, ref: 'User' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)
addressSchema.index({
  '$**': 'text',
})
export const Address = mongoose.model<AddressDocument>('Address', addressSchema)
