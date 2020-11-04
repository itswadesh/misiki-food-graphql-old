import { Slug } from '../models'
import { SlugDocument } from './../types'
export const generateSlug = async (str: string) => {
  if (!str) return ''
  let rawSlug = str
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '')
  try {
    let newSlug = rawSlug
    let foundSlug: SlugDocument | null
    do {
      foundSlug = await Slug.findOne({ slug: newSlug })
      if (foundSlug) newSlug = newSlug + '-en'
    } while (foundSlug)
    let slug = new Slug({ slug: newSlug })
    await slug.save()
    return newSlug
  } catch (e) {
    return rawSlug
  }
}
