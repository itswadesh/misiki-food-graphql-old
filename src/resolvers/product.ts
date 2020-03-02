import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter
} from 'apollo-server-express'
import {
  Request,
  MessageDocument,
  UserDocument,
  ProductDocument,
  ChatDocument
} from '../types'
import { sendMessage, objectId, createProduct, ifImage } from '../validators'
import { Chat, Message, Product } from '../models'
import { fields, hasSubfields } from '../utils'
import pubsub from '../pubsub'
import { createWriteStream, unlink } from 'fs'
import mkdirp from 'mkdirp'
import shortid from 'shortid'
import { generateImg, storeToFileSystem } from '../utils/image'

const UPLOAD_DIR = './uploads'
const MESSAGE_SENT = 'MESSAGE_SENT'
mkdirp.sync(UPLOAD_DIR)
const resolvers: IResolvers = {
  Query: {
    files: () => {
      // Return the record of files uploaded from your DB or API or filesystem.
    },
    products: (root, args, ctx, info): Promise<ProductDocument[]> => {
      return Product.find({}, fields(info)).exec()
    },
    product: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<ProductDocument | null> => {
      await objectId.validateAsync(args)
      return Product.findById(args.id, fields(info))
    }
  },

  Mutation: {
    singleUpload: async (root, args, { req }: { req: Request }) => {
      const { createReadStream, filename, mimetype, encoding } = await args
      const stream = createReadStream()
      const id = shortid.generate()
      const path1 = `${UPLOAD_DIR}/${id}-${filename}`
      const { userId } = req.session
      const file = { id, filename, mimetype, encoding, uid: userId }
      await ifImage.validateAsync({ filename, mimetype, encoding })
      // if (!filename.match(/\.(jfif|jpg|jpeg|png|gif|webp|ico)$/))
      //   throw new UserInputError('Only image files are allowed!')
      // let img = await generateImg(file, 'photoooo', false) // If this image is from Step:3 // req.params.name = brand OR category
      // return img
      await storeToFileSystem(stream, path1)
      return file
    },
    updateProduct: async (
      root,
      args: {
        id: string
        name: string
        description: string
        type: string
        rate: number
        stock: number
        img: string
        time: string
      },
      { req }: { req: Request }
    ): Promise<ProductDocument> => {
      // await updateProduct.validateAsync(args, { abortEarly: false })

      const { userId } = req.session
      const { id, name, description, type, rate, stock, img, time } = args
      let product = await Product.findOneAndUpdate(
        { _id: id },
        { $set: { ...args, uid: userId } }
      ) // If pre hook to be executed for product.save()
      if (!product) throw new UserInputError(`Product with id= ${id} not found`)

      // let product: ProductDocument | null = await Product.findById(id) // TODO: Check if null values replace the existing
      // product.name = name
      // product.description = description
      // product.type = type
      // product.rate = rate
      // product.stock = stock
      // product.img = img
      // product.vendor = userId

      // await product.save()

      return product
    },
    createProduct: async (
      root,
      args: {
        name: string
        description: string
        type: string
        rate: number
        stock: number
        img: string
        time: string
      },
      { req }: { req: Request }
    ): Promise<ProductDocument> => {
      await createProduct.validateAsync(args, { abortEarly: false })

      const { userId } = req.session
      const { name, description, type, rate, stock, img, time } = args
      const product = await Product.create({
        name,
        description,
        type,
        rate,
        stock,
        img,
        time,
        vendor: userId
      })

      await product.save()

      return product
    }
  },

  Product: {
    vendor: async (
      product: ProductDocument,
      args,
      ctx,
      info
    ): Promise<UserDocument> => {
      return (await product.populate('vendor', fields(info)).execPopulate())
        .vendor
    }
  }
  // lastMessage: async (
  //   chat: ChatDocument,
  //   args,
  //   ctx,
  //   info
  // ): Promise<MessageDocument> => {
  //   return (await chat.populate('lastMessage', fields(info)).execPopulate())
  //     .lastMessage
  // }
  // }
}

export default resolvers
