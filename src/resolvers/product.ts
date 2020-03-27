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
  validate,
  objectId,
  productSchema,
  ifImage
} from '../validation'
import { Chat, Message, Product } from '../models'
import { fields, hasSubfields, getData } from '../utils'
import pubsub from '../pubsub'

import { deleteFile } from '../utils/image'
import { index, indexSub } from '../utils/base'
import { getStartEndDate3 } from '../utils/dates'

const MESSAGE_SENT = 'MESSAGE_SENT'
const resolvers: IResolvers = {
  Query: {
    products: (root, args, { req }: { req: Request }, info) => {
      return indexSub({ model: Product, args, info })
    },
    popular: (root, args, { req }: { req: Request }, info) => {
      args.sort = 'stats.popularity'
      args.limit = 10
      return index({ model: Product, args, info })
    },
    bestSellers: async (root, args, { req }: { req: Request }, info) => {
      let q: any = {};
      if (req.query.daily && req.query.daily != "null") {
        q.daily = req.query.daily;
      }
      if (req.query.type && req.query.type != "null") {
        q.type = req.query.type;
      }
      if (req.query.search) q.q = { $regex: new RegExp(req.query.search, "ig") };

      const { start, end } = getStartEndDate3(0);
      let t = await getData(start, end, q);
      const startEnd1 = getStartEndDate3(1);
      let t1 = await getData(startEnd1.start, startEnd1.end, q);
      const startEnd2 = getStartEndDate3(2);
      let t2 = await getData(startEnd2.start, startEnd2.end, q);
      const startEnd3 = getStartEndDate3(3);
      let t3 = await getData(startEnd3.start, startEnd3.end, q);
      const startEnd4 = getStartEndDate3(4);
      let t4 = await getData(startEnd4.start, startEnd4.end, q);
      return { t, t1, t2, t3, t4 }
    },
    search: (root, args, { req }: { req: Request }, info) => {
      args.stock = { $gt: 0 }
      return index({ model: Product, args, info })
    },
    myProducts: (root, args, { req }: { req: Request }, info) => {
      args.vendor = req.session.userId
      return index({ model: Product, args, info })
    },
    productSlug: async (
      root,
      args: { slug: string },
      ctx,
      info
    ): Promise<ProductDocument | null> => {
      return Product.findOne({ slug: args.slug }, fields(info))
    },
    product: async (
      root,
      args: { id: string },
      ctx,
      info
    ): Promise<ProductDocument | null> => {
      await objectId.validateAsync(args)
      return Product.findById(args.id, fields(info)).populate('category')
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
        price: number
        stock: number
        img: string
        time: string
        category: string
      },
      { req }: { req: Request }
    ): Promise<ProductDocument> => {
      await validate(productSchema, args)
      const { userId } = req.session
      const { id, name, description, type, price, stock, img, time } = args
      let product = await Product.findOneAndUpdate(
        { _id: id },
        { $set: { ...args, vendor: userId } },
        { new: true }
      ) // If pre hook to be executed for product.save()
      if (!product) throw new UserInputError(`Product with id= ${id} not found`)
      // let product: ProductDocument | null = await Product.findById(id) // TODO: Check if null values replace the existing
      // product.name = name
      // product.description = description
      // product.type = type
      // product.price = price
      // product.stock = stock
      // product.img = img
      // product.vendor = userId

      await product.save() // To fire pre save hoook
      return product.populate('category').execPopulate()
    },
    // saveVariant: async (
    //   root,
    //   args: {
    //     id: string
    //     name: string
    //     price: number
    //     stock: number
    //     img: string
    //   },
    //   { req }: { req: Request }
    // ): Promise<ProductDocument> => {
    //   await productValidation.validateAsync(args, { abortEarly: false })

    //   const { userId } = req.session
    //   const { id, name, price, stock, img } = args
    //   console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', args);
    //   // let product = await Product.findOneAndUpdate(
    //   //   { _id: id },
    //   //   { $set: { ...args, uid: userId } }
    //   // )
    //   // if (!product) throw new UserInputError(`Product with id= ${id} not found`)

    //   // await product.save() // To fire pre save hoook

    //   // return product
    // },
    createProduct: async (
      root,
      args: {
        name: string
        description: string
        type: string
        price: number
        stock: number
        img: string
        time: string
        category: string
      },
      { req }: { req: Request }
    ): Promise<ProductDocument> => {
      await validate(productSchema, args)

      const { userId } = req.session
      const { name, description, type, price, stock, img, time, category } = args
      const product = await Product.create({
        name,
        description,
        type,
        price,
        stock,
        img,
        time,
        vendor: userId,
        category
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
