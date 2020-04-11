import mongoose, { Schema } from 'mongoose'
import { CityDocument } from '../types'

const { ObjectId } = Schema.Types

const citySchema = new Schema(
  {
    name: String,
    user: { type: ObjectId, ref: 'User' },
    lat: { type: Number },
    lng: { type: Number },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
)
citySchema.index({ '$**': 'text' })
export const City = mongoose.model<CityDocument>('City', citySchema)
