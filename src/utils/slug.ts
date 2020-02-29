import { Setting } from '../models'

export const generateSlug = async (str: string) => {
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
    let foundSlug
    do {
      foundSlug = await Setting.findOne({ slug: newSlug })
      if (foundSlug) newSlug = newSlug + '-en'
    } while (foundSlug)
    return newSlug
  } catch (e) {
    return rawSlug
  }
}
