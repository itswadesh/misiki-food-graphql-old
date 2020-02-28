const request = require('request-promise');
const fsx = require('fs-extra'); // Create the directory if not exists
const path = require('path');
const dload = require('image-downloader')
import { uploadDir } from '../../config'
export const imgUrlBanner = (banner, single) => {
    let url = "/images"
    if (!banner)
        return
    if (single) {
        return { img: url + banner.img, h1: banner.h1, h2: banner.h2, h3: banner.h3, link: banner.link }
    }
    return banner.map(({ img, h1, h2, h3, link }) => {
        return { img: url + img, h1, h2, h3, link }
    });
};
export const imgUrl = (img, single) => {
    let url = "/images"
    if (!img)
        return
    else if (single)
        return url + img
    else if (img.constructor === Array)
        return img.map((i) => {
            return { small: url + i.small, medium: url + i.medium, large: url + i.large }
        });
    else // If a single object than an array
        return { small: url + img.small, medium: url + img.medium, large: url + img.large }

}

export const generateImg = async (imgUrls, subdirectory: String, datewise: Boolean) => {
    let imageCollection = []
    let finalDir = subdirectory + '/'
    if (datewise) {
        finalDir += getDate() + '/'
    }
    await createFolder(uploadDir + '/' + finalDir) // images/product/090919
    for (let i of imgUrls) {
        if (i) {
            let img = null, name, url
            if (i.name) { // If images is uploaded one. e.g. media.controller.ts
                name = i.name
                url = i.path.replace(/\\/g, "/")
            } else {
                url = name = i
            }
            let filename = path.basename(name).split('.')[0] + '-' + Math.floor(new Date().valueOf() * Math.random()) + path.extname(name)
            // if (url && url.substr(0, 15) == subdirectory + '/large/') { // If imported from excel sheet
            //     continue
            // }
            img = '/' + finalDir + filename
            if (img.indexOf('?') > 0)
                img = img.substring(0, img.indexOf('?')); // Remove anything after ?
            try {
                await fsx.moveSync(url, uploadDir + '/' + finalDir + filename, { overwrite: true })
            } catch (e) {
                // console.log('Image upload err:: ', e.toString());
            }
            try {
                var pattern = /^((http|https|ftp):\/\/)/;
                let isUrl = (pattern.test(url))
                if (isUrl)
                    await download(url, uploadDir + '/' + finalDir + filename)
                imageCollection.push(img)
            } catch (e) {
                throw e;
                // console.log('Image from URL err:: ', e.toString());
            }
        }
    }
    return imageCollection
}
const download = async (url, dest) => {
    if (url.indexOf('?') > 0)
        url = url.substring(0, url.indexOf('?')); // Remove anything after ?
    if (dest.indexOf('?') > 0)
        dest = dest.substring(0, dest.indexOf('?')); // Remove anything after ?
    try {
        let res = await request.head(url)
        if (!res) return
        const contentType = res['content-type']
        // console.log('contentType:::', contentType);
        if (contentType == 'image/jpeg' || contentType == 'image/gif' || contentType == 'image/png' || contentType == 'image/ico' || contentType == 'image/webp') {
            await dload({ url, dest });
        }
    } catch (e) {
        throw e
    }
};
export const deleteImage = async (image) => {
    try {
        await fsx.unlinkSync(uploadDir + image)
    } catch (e) {
        throw e
    }
}
export const deleteAllImages = async (images) => {
    try {
        if (!images) return
        let deleted = []
        for (const i of images) {
            if (!i) continue
            try {
                let data = await fsx.unlinkSync(uploadDir + i)
                deleted.push(data)
            } catch (e) {
                console.error('deleteAllImages:large: Image not found', e.message);
            }
        }
        return deleted
    } catch (e) {
        throw e
    }
}
const readFile = async (url) => {
    var pattern = /^((http|https|ftp):\/\/)/;
    let isUrl = (pattern.test(url))
    try {
        let stream
        if (isUrl) {
            stream = await request({ url, encoding: null })
        } else {
            stream = await fsx.createReadStream(path.resolve(url))
            stream.on('error', function (err) { });
        }
        return stream
    } catch (e) {
        // console.log('readFileError...', e.toString());
        return
    }
}

export const checkIfImage = async (photos) => {
    let p = await photos.map(photo => {
        if (!photo || !photo.originalFilename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|ico)$/)) {
            throw 'Only image files are allowed!'
        } else {
            return photo//{ name: photo.originalFilename, path: photo.path.replace(/\\/g, "/").replace(uploadDir, '') }
        }
    })
    return p
}

export const createFolder = async (path) => {
    try {
        if (!fsx.existsSync(path))
            fsx.ensureDirSync(path)
    } catch (e) {
        console.log('Directory creation error ', e);
    }
}
function getDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();
    let dd1 = ''
    let mm1 = ''
    if (dd < 10) {
        dd1 = '0' + dd;
    } else {
        dd1 = '' + dd;
    }
    if (mm < 10) {
        mm1 = '0' + mm;
    } else {
        mm1 = '' + mm
    }
    return dd1 + mm1 + yyyy
}
// function isURL(url) {

//     return false
// }