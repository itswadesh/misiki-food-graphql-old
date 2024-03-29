import { Slug } from '../models'
import { SlugDocument } from './../types'
export const generateSlug = async (str: string, currentSlug: string) => {
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
      await Slug.deleteMany({ slug: currentSlug })
      foundSlug = await Slug.findOne({ slug: newSlug })
      if (foundSlug) newSlug = newSlug + '-en'
    } while (foundSlug)
    const s = new Slug({ slug: newSlug })
    await s.save()
    // await Slug.create({ slug: 'newSlug' })
    return newSlug
  } catch (e) {
    return rawSlug
  }
}
