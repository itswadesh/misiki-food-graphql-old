import mongoose, { Schema } from 'mongoose'
import { EmailTemplateDocument } from '../types'
import { generateSlug } from '../utils'

const { ObjectId } = Schema.Types

const emailTemplateSchema = new Schema(
  {
    id: String,
    name: String,
    title: String,
    description: String,
    content: String,
    user: { type: ObjectId, ref: 'User' },
    active: { type: Boolean, default: true }
  },
  { versionKey: false, timestamps: true }
)
emailTemplateSchema.pre('save', async function(this: EmailTemplateDocument) {
  if (!this.slug) this.slug = await generateSlug(this.name)
})
emailTemplateSchema.index({ '$**': 'text' })
export const EmailTemplate = mongoose.model<EmailTemplateDocument>(
  'EmailTemplate',
  emailTemplateSchema
)
