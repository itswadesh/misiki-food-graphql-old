import mongoose, { Schema } from 'mongoose'
import { CategoryDocument } from '../types'

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
    megamenu: Boolean,
    meta: String,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    img: String,
    featured: { type: Boolean, default: false },
    shopbycategory: Boolean,
    children: [{ type: ObjectId, ref: 'Category' }],
    uid: String,
    count: Number,
    sizechart: String,
    q: String,
    updated: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
  },
  schemaOptions
)

// categorySchema.pre('save', async function(next) {
//   let parentCategory = await this.constructor.findById(this.pid)
//   parentCategory = parentCategory || {
//     path: '',
//     slugPath: '',
//     namePath: '',
//     level: 0,
//     pathA: [],
//     children: []
//   }
//   if (parentCategory.slug) {
//     // Only apply on insertation
//     let pslug = parentCategory.slugPath.split('/')[1].trim()
//     this.slug = pslug + '-' + (await generateSlug(this.name))
//   } else {
//     this.slug = await generateSlug(this.name)
//   }
//   this.path = parentCategory.path + '/' + this._id
//   this.slugPath = parentCategory.slugPath + ' / ' + this.slug
//   this.namePath = parentCategory.namePath + ' / ' + this.name
//   this.level = parentCategory.level + 1
//   parentCategory.children.push(this._id)
//   let nodupes = dedupeIDs(parentCategory.children)
//   await this.constructor.update(
//     { _id: this.pid },
//     { $set: { children: nodupes } }
//   )
//   next()
// })

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
