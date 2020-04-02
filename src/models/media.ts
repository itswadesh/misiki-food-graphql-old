import mongoose, { Schema } from 'mongoose'
import { MediaDocument } from '../types'

const { ObjectId } = Schema.Types

const mediaSchema = new Schema(
  {
    originalFilename: String,
    src: String,
    path: Object,
    size: String,
    type: String,
    name: String, // used for single image upload like Logo. helps while deleting
    uid: { type: ObjectId, ref: 'User' },
    uname: String,
    uemail: String,
    uphone: String,
    use: String,
    q: String,
    active: { type: Boolean, default: true }
  },
  {
    versionKey: false,
    timestamps: true
  }
)
mediaSchema.index({
  '$**': 'text'
});
export default mongoose.model<MediaDocument>('Media', mediaSchema)
