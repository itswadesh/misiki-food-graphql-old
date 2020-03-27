import mongoose, { Schema } from 'mongoose'
import { CategoryDocument } from '../types'
import { generateSlug } from '../utils'

const { ObjectId } = Schema.Types
var schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true
}
const categorySchema = new Schema(
  {
    index: Number,
    name: String,
    slug: String,
    pid: String,
    path: String,
    slugPath: String,
    namePath: String,
    pathA: Array,
    level: { type: Number, default: 0 },
    position: { type: Number, default: 0 },
    megamenu: { type: Boolean, default: false },
    meta: String,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    img: String,
    featured: { type: Boolean, default: false },
    shopbycategory: { type: Boolean, default: false },
    children: [{ type: ObjectId, ref: 'Category' }],
    user: { type: ObjectId, ref: 'User' },
    count: Number,
    sizechart: String,
    updated: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    q: String
  },
  schemaOptions
)

categorySchema.pre('save', async function (this: CategoryDocument) {
  if (!this.slug) {
    this.slug = await generateSlug(this.name)
  }
  this.q = this.name ? this.name.toLowerCase() + " " : "";
  this.q += this.active ? this.active + " " : "";
  this.q = this.q.trim()
})

// categorySchema.pre('remove', async function(next) {
//   let parentCategory = await this.constructor.findById(this.pid)
//   let vm = this
//   if (parentCategory) {
//     let children = parentCategory.children.filter(function(value) {
//       return value.toString() != vm._id.toString()
//     })
//     let nodupes = dedupeIDs(children)
//     await this.constructor.update(
//       { _id: this.pid },
//       { $set: { children: nodupes } }
//     )
//   }
//   next()
// })
// function dedupeIDs(objectIDs:CategoryDocument) {
//   const ids = {}
//   objectIDs.forEach(_id => (ids[_id.toString()] = _id))
//   return Object['values'](ids)
// }
export default mongoose.model<CategoryDocument>('Category', categorySchema)
