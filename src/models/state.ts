import mongoose, { Schema } from 'mongoose'
import { StateDocument } from '../types'

const stateSchema = new Schema(
  {
    name: String,
    slug: String,
    value: String,
    code: String,
    img: String,
    flag: String,
    lang: String,
    sort: Number,
    active: { type: Boolean, default: true },
    q: String,
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

stateSchema.index({
  '$**': 'text',
})
export const State = mongoose.model<StateDocument>('State', stateSchema)
