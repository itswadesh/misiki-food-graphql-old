const request = require('request-promise')
const fsx = require('fs-extra') // Create the directory if not exists
const path = require('path')
const dload = require('image-downloader')
import { createWriteStream, unlink, ReadStream, PathLike } from 'fs'
import { UPLOAD_DIR, STATIC_PATH } from '../config'
import mkdirp from 'mkdirp'
import shortid from 'shortid'
import { validate, ifImage } from '../validation'
mkdirp.sync(STATIC_PATH + UPLOAD_DIR)

export const imgUrl = (img: any, single: Boolean) => {
  let url = '/images'
  if (!img) return
  else if (single) return url + img
  else if (img.constructor === Array)
    return img.map((i: any) => {
      return {
        small: url + i.small,
        medium: url + i.medium,
        large: url + i.large
      }
    })
  // If a single object than an array
  else
    return {
      small: url + img.small,
      medium: url + img.medium,
      large: url + img.large
    }
}
export const store1ToFileSystem = async (args: {
  file: any
  folder: String
}) => {
  const folder = args.folder || 'img'
  mkdirp.sync(STATIC_PATH + UPLOAD_DIR + '/' + folder)
  let { createReadStream, filename, mimetype, encoding } = await args.file
  await validate(ifImage, { filename, mimetype, encoding })
  const stream = createReadStream()
  const id = shortid.generate()
  filename = `${UPLOAD_DIR}${folder}/${id}-${filename}`
  const path = `${STATIC_PATH + filename}`
  const file = { filename, mimetype, encoding }
  try {
    await fileWriteRequest(stream, path)
    return { filename, mimetype, encoding }
  } catch (error) {}
}
export const storeToFileSystem = async (args: {
  files: any
  folder: String
}) => {
  const folder = args.folder || 'img'
  mkdirp.sync(STATIC_PATH + UPLOAD_DIR + '/' + folder)
  let files: any[] = []
  for (let f of args.files) {
    let { createReadStream, filename, mimetype, encoding }: any = await f
    // await ifImage.validateAsync({ f.filename, f.mimetype, f.encoding })
    const stream = createReadStream()
    const id = shortid.generate()
    filename = `${UPLOAD_DIR}${folder}/${id}-${filename}`
    const path = `${STATIC_PATH + filename}`
    try {
      await fileWriteRequest(stream, path)
      files.push({ filename, mimetype, encoding })
    } catch (error) {}
  }
  return files
}

const fileWriteRequest = async (stream: any, path: PathLike) => {
  return new Promise((resolve, reject) => {
    const writeStream = createWriteStream(path)
    writeStream.on('finish', resolve)
    writeStream.on('error', error => {
      unlink(path, () => {
        reject(error)
      })
    })
    stream.on('error', (error: Error) => writeStream.destroy(error))
    stream.pipe(writeStream)
  })
    .then(() => {
      return path
    })
    .catch((e: Error) => {
      throw e
    })
}
export const generateImg = async (
  imgUrls: any[],
  subdirectory: String,
  datewise: Boolean
) => {
  let imageCollection = []
  let finalDir = subdirectory + '/'
  if (datewise) {
    finalDir += getDate() + '/'
  }
  await createFolder(UPLOAD_DIR + '/' + finalDir) // images/product/090919
  for (let i of imgUrls) {
    if (i) {
      let img = null,
        name,
        url
      if (i.name) {
        // If images is uploaded one. e.g. media.controller.ts
        name = i.name
        url = i.path.replace(/\\/g, '/')
      } else {
        url = name = i
      }
      let filename =
        path.basename(name).split('.')[0] +
        '-' +
        Math.floor(new Date().valueOf() * Math.random()) +
        path.extname(name)
      // if (url && url.substr(0, 15) == subdirectory + '/large/') { // If imported from excel sheet
      //     continue
      // }
      img = '/' + finalDir + filename
      if (img.indexOf('?') > 0) img = img.substring(0, img.indexOf('?')) // Remove anything after ?
      try {
        await fsx.moveSync(url, UPLOAD_DIR + '/' + finalDir + filename, {
          overwrite: true
        })
      } catch (e) {
        // console.log('Image upload err:: ', e.toString());
      }
      try {
        var pattern = /^((http|https|ftp):\/\/)/
        let isUrl = pattern.test(url)
        if (isUrl) await download(url, UPLOAD_DIR + '/' + finalDir + filename)
        imageCollection.push(img)
      } catch (e) {
        throw e
        // console.log('Image from URL err:: ', e.toString());
      }
    }
  }
  return imageCollection
}
const download = async (url: String, dest: String) => {
  if (url.indexOf('?') > 0) url = url.substring(0, url.indexOf('?')) // Remove anything after ?
  if (dest.indexOf('?') > 0) dest = dest.substring(0, dest.indexOf('?')) // Remove anything after ?
  try {
    let res = await request.head(url)
    if (!res) return
    const contentType = res['content-type']
    // console.log('contentType:::', contentType);
    if (
      contentType == 'image/jpeg' ||
      contentType == 'image/gif' ||
      contentType == 'image/png' ||
      contentType == 'image/ico' ||
      contentType == 'image/webp'
    ) {
      await dload({ url, dest })
    }
  } catch (e) {
    throw e
  }
}
export const deleteFile = async (path: String) => {
  try {
    return await fsx.unlinkSync(STATIC_PATH + path)
  } catch (e) {
    return null
  }
}
export const deleteAllImages = async (images: String[]) => {
  try {
    if (!images) return
    let deleted = []
    for (const i of images) {
      if (!i) continue
      try {
        let data = await fsx.unlinkSync(UPLOAD_DIR + i)
        deleted.push(data)
      } catch (e) {
        console.error('deleteAllImages:large: Image not found', e.message)
      }
    }
    return deleted
  } catch (e) {
    throw e
  }
}
const readFile = async (url: string) => {
  var pattern = /^((http|https|ftp):\/\/)/
  let isUrl = pattern.test(url)
  try {
    let stream
    if (isUrl) {
      stream = await request({ url, encoding: null })
    } else {
      stream = await fsx.createReadStream(path.resolve(url))
      stream.on('error', function(err: Error) {})
    }
    return stream
  } catch (e) {
    // console.log('readFileError...', e.toString());
    return
  }
}

export const checkIfImage = async (photos: any[]) => {
  let p = await photos.map(photo => {
    if (
      !photo ||
      !photo.originalFilename
        .toLowerCase()
        .match(/\.(jpg|jpeg|png|gif|webp|ico)$/)
    ) {
      throw 'Only image files are allowed!'
    } else {
      return photo //{ name: photo.originalFilename, path: photo.path.replace(/\\/g, "/").replace(UPLOAD_DIR, '') }
    }
  })
  return p
}

export const createFolder = async (path: string) => {
  try {
    if (!fsx.existsSync(path)) fsx.ensureDirSync(path)
  } catch (e) {
    console.log('Directory creation error ', e)
  }
}
function getDate() {
  let today = new Date()
  let dd = today.getDate()
  let mm = today.getMonth() + 1 //January is 0!
  let yyyy = today.getFullYear()
  let dd1 = ''
  let mm1 = ''
  if (dd < 10) {
    dd1 = '0' + dd
  } else {
    dd1 = '' + dd
  }
  if (mm < 10) {
    mm1 = '0' + mm
  } else {
    mm1 = '' + mm
  }
  return dd1 + mm1 + yyyy
}
// function isURL(url) {

//     return false
// }
