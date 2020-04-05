import mongoose, { Schema } from 'mongoose'
import { FeatureDocument } from '../types'

const { ObjectId } = Schema.Types

const optionsSchema = new Schema({
  name: { type: String },
  value: { type: String },
  slug: { type: String },
  position: { type: Number, default: 0 }
})
let featureSchema = new mongoose.Schema(
  {
    name: String,
    options: [optionsSchema],
    key: String,
    val: String,
    categories: [{ type: ObjectId, ref: 'Category' }],
    position: { type: Number, default: 0 },
    info: String,
    slug: String,
    active: Boolean,
    isFilter: Boolean
  },
  {
    versionKey: false,
    timestamps: true
  }
)
featureSchema.index({
  '$**': 'text'
});
export const Feature = mongoose.model<FeatureDocument>('Feature', featureSchema)
