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
import {
  sendMessage,
  objectId,
  productValidation,
  ifImage
} from '../validators'
import { Chat, Message, Product } from '../models'
import { fields, hasSubfields } from '../utils'
import pubsub from '../pubsub'

import { deleteFile } from '../utils/image'
import { index } from '../utils/base'

const MESSAGE_SENT = 'MESSAGE_SENT'
const resolvers: IResolvers = {
  Query: {
    files: () => {
      // Return the record of files uploaded from your DB or API or filesystem.
    },
    products: (root, args, { req }: { req: Request }, info) => {
      return Product.find({}, fields(info)).exec()
    },
    search: (root, args, { req }: { req: Request }, info) => {
      return index({ model: Product, args, info })
    },
    my: (root, args, { req }: { req: Request }, info) => {
      args.uid = req.session.userId
      return index({ model: Product, args, info })
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
    deleteProduct: async (
      root,
      args,
      { req }: { req: Request }
    ): Promise<Boolean> => {
      const product = await Product.findById(args.id)
      if (!product) return true
      await deleteFile(product.img)
      let p = await Product.deleteOne({ _id: args.id })
      return p.ok == 1
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
      await productValidation.validateAsync(args, { abortEarly: false })

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

      await product.save() // To fire pre save hoook

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
      await productValidation.validateAsync(args, { abortEarly: false })

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
