import mongoose, { Schema } from 'mongoose'
import { CategoryDocument } from '../types'
import { generateSlug } from '../utils'

const { ObjectId } = Schema.Types
var schemaOptions = {
  toObject: { getters: true },
  toJSON: { getters: true },
  versionKey: false,
  timestamps: true,
}
const categorySchema = new Schema(
  {
    index: Number,
    name: String,
    slug: String,
    pid: String,
    path: String,
    parent: { type: ObjectId, ref: 'Category' },
    slugPath: String,
    namePath: String,
    pathA: [{ type: ObjectId, ref: 'Category' }],
    slugPathA: [{ type: String, default: '' }],
    namePathA: [{ type: String, default: '' }],
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
    active: { type: Boolean, default: true },
    q: String,
  },
  schemaOptions
)

categorySchema.pre('save', async function (this: CategoryDocument) {
  this.q = this.name ? this.name.toLowerCase() + ' ' : ''
  this.q += this.active ? this.active + ' ' : ''
  this.q = this.q.trim()
})

categorySchema.pre('findOneAndUpdate', async function () {
  // @ts-ignore
  const docToUpdate = await this.model.findOne(this.getQuery())
  // @ts-ignore
  await this.model.updateOne(
    // @ts-ignore
    { _id: docToUpdate.parent },
    // @ts-ignore
    { $pull: { children: docToUpdate._id } }
  )
})

categorySchema.post('findOneAndUpdate', async function (doc: CategoryDocument) {
  if (!doc) return
  // opetation on parent
  if (!doc.level) doc.level = 0
  // @ts-ignore
  await doc.constructor.updateOne(
    { _id: doc.parent },
    { $addToSet: { children: doc._id } }
  )
  // @ts-ignore
  const newParent = await doc.constructor.findOne({ _id: doc.parent })
  // Generate my slug
  let parentSlug = ''
  if (newParent && newParent.level != 0) {
    parentSlug = newParent.slug + ' '
  }
  if (doc.name)
    // && !doc.slug // Always update slug when category hierarchy changes
    doc.slug = await generateSlug(parentSlug + doc.name, doc.slug)

  // Generate pathA, slugPathA, namePathA

  let pathA: any = [],
    slugPathA: any = [],
    namePathA: any = []
  // @ts-ignore
  let me = doc //await doc.constructor.findById(doc.parent)
  for (let i = 0; i < 10; i++) {
    // @ts-ignore
    let p1 = await doc.constructor.findById(me.parent)
    if (!p1) break
    pathA.push(p1._id)
    slugPathA.push(p1.slug)
    namePathA.push(p1.name)
    me = p1
  }
  doc.level = pathA.length
  doc.pathA = pathA.reverse()
  doc.path = doc.pathA.join('/').trim()
  doc.slugPathA = slugPathA.reverse()
  doc.slugPath = doc.slugPathA.join('/').trim()
  doc.namePathA = namePathA.reverse()
  doc.namePath = doc.namePathA.join('/').trim()
})
function dedupeIDs(objectIDs: Array<String>) {
  const ids: any = {}
  objectIDs.forEach((_id) => (ids[_id.toString()] = _id))
  return Object['values'](ids)
}
categorySchema.index({
  '$**': 'text',
})
export const Category = mongoose.model<CategoryDocument>(
  'Category',
  categorySchema
)
