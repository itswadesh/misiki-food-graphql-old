import { Types } from 'mongoose'
import {
  IResolvers,
  UserInputError,
  ForbiddenError,
  withFilter,
} from 'apollo-server-express'
import {
  Request,
  MessageDocument,
  UserDocument,
  ProductDocument,
  ChatDocument,
} from '../types'
import { validate, objectId, productSchema, ifImage } from '../validation'
import { Product, User, Slug } from '../models'
import { fields, hasSubfields, getData } from '../utils'
import pubsub from '../pubsub'

import { deleteFile } from '../utils/image'
import { index, indexSub } from '../utils/base'
import { getStartEndDate3 } from '../utils/dates'
import product from '../typeDefs/product'

const MESSAGE_SENT = 'MESSAGE_SENT'
const resolvers: IResolvers = {
  Query: {
    productsByIds: (root: any, args: any, { req }: { req: Request }, info) => {
      return Product.find({
        _id: {
          $in: args.ids,
        },
      }).limit(10)
    },
    products: (root: any, args: any, { req }: { req: Request }, info) => {
      args.populate = 'category'
      // if (args.active) {
      //   args.stock = { $gt: 0 }
      // }
      return index({ model: Product, args, info })
    },
    popular: (root: any, args: any, { req }: { req: Request }, info) => {
      args.stock = { $gt: 0 }
      args.sort = '-popularity'
      args.limit = 10
      return index({ model: Product, args, info })
    },
    bestSellers: async (
      root: any,
      args: any,
      { req }: { req: Request },
      info
    ) => {
      let q: any = {}
      if (req.query.daily && req.query.daily != 'null') {
        q.daily = req.query.daily
      }
      if (req.query.type && req.query.type != 'null') {
        q.type = req.query.type
      }
      const s: any = req.query.search
      if (req.query.search) q.q = { $regex: new RegExp(s, 'ig') }
      // q.stock = { $gt: 0 }

      const { start, end } = getStartEndDate3(0)
      let t = await getData(start, end, q)
      const startEnd1 = getStartEndDate3(1)
      let t1 = await getData(startEnd1.start, startEnd1.end, q)
      const startEnd2 = getStartEndDate3(2)
      let t2 = await getData(startEnd2.start, startEnd2.end, q)
      const startEnd3 = getStartEndDate3(3)
      let t3 = await getData(startEnd3.start, startEnd3.end, q)
      const startEnd4 = getStartEndDate3(4)
      let t4 = await getData(startEnd4.start, startEnd4.end, q)
      return { t, t1, t2, t3, t4 }
    },
    search: (root: any, args: any, { req }: { req: Request }, info) => {
      if (!args.city) throw new UserInputError('Please select city')
      args.stock = { $gt: 0 }
      return index({ model: Product, args, info })
    },
    myProducts: (root: any, args: any, { req }: { req: Request }, info) => {
      args.vendor = req.session.userId
      // args.populate = 'vendor'
      return index({ model: Product, args, info })
    },
    productSlug: async (
      root: any,
      args: { slug: string },
      ctx,
      info
    ): Promise<ProductDocument | null> => {
      return Product.findOne({ slug: args.slug }, fields(info))
    },
    product: async (
      root: any,
      args: { id: string },
      ctx,
      info
    ): Promise<ProductDocument | null> => {
      await objectId.validateAsync(args)
      return Product.findById(args.id, fields(info))
        .populate('categories')
        .populate('category')
    },
  },

  Mutation: {
    deleteProduct: async (
      root: any,
      args: any,
      { req }: { req: Request }
    ): Promise<Boolean> => {
      const { userId } = req.session
      const product = await Product.findById(args.id)
      if (!product) throw new UserInputError('Item not found')
      const user = await User.findById(userId)
      if (!user) throw new UserInputError('Please login again to continue')
      if (!user.verified)
        throw new UserInputError('You must be verified by admin to delete item')
      if (user.role == 'admin' || product.vendor == userId) {
        let p = await Product.findByIdAndDelete({ _id: args.id })
        if (p) {
          await deleteFile(product.img)
          await Slug.deleteOne({ slug: p.slug })
          return true
        } else {
          return false
        }
      } else {
        throw new UserInputError('Item does not belong to you')
      }
    },
    saveProduct: async (
      root: any,
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
        vendor: UserDocument
      },
      { req }: { req: Request }
    ): Promise<ProductDocument> => {
      // await validate(productSchema, args) // During image removal, only img attribute is passed
      const { id, name, description, type, price, stock, img, time } = args
      const { userId } = req.session
      const user = await User.findById(userId)
      if (!user) throw new UserInputError('Please login again to continue')
      if (user.role != 'admin' && !user.verified)
        throw new UserInputError('You must be verified by admin to update item')
      const forUpdate =
        user.role == 'admin' ? args : { ...args, vendor: userId }
      let newProduct
      if (args.id) {
        const product = await Product.findById(args.id)
        if (!product)
          throw new UserInputError(`Product with id= ${id} not found`)
        if (user.role !== 'admin' && product.vendor != userId)
          // Always use != instead of !== so that type checking is skipped
          throw new Error('This item does not belong to you')
        newProduct = await Product.findOneAndUpdate(
          { _id: id },
          { $set: forUpdate },
          { new: true }
        ) // If pre hook to be executed for product.save()
      } else {
        let newProduct = new Product(forUpdate)
        await newProduct.save()
      }
      if (!newProduct) throw new UserInputError(`Error updating item id= ${id}`)
      await newProduct.save() // To fire pre save hoook
      return newProduct.populate('category').execPopulate()
    },
    // saveVariant: async (
    //   root:any,
    //   args: {
    //     id: string
    //     name: string
    //     price: number
    //     stock: number
    //     img: string
    //   },
    //   { req }: { req: Request }
    // ): Promise<ProductDocument> => {
    //   await productValidation.validateAsync(args:any, { abortEarly: false })

    //   const { userId } = req.session
    //   const { id, name, price, stock, img } = args
    //   console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', args);
    //   // let product = await Product.findOneAndUpdate(
    //   //   { _id: id },
    //   //   { $set: { ...args:any, user: userId } }
    //   // )
    //   // if (!product) throw new UserInputError(`Product with id= ${id} not found`)

    //   // await product.save() // To fire pre save hoook

    //   // return product
    // },
    createProduct: async (
      root: any,
      args: {
        name: string
        description: string
        type: string
        city: string
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
      const {
        name,
        description,
        type,
        city,
        price,
        stock,
        img,
        time,
        category,
      } = args

      const user = await User.findById(userId)
      if (!user || !user.verified)
        throw new UserInputError('You must be verified by admin to create item')

      const product = new Product({
        name,
        description,
        type,
        price,
        stock,
        img,
        time,
        city,
        vendor: userId,
        category,
      })

      await product.save()
      return product.populate('category').execPopulate()
    },
  },

  Product: {
    vendor: async (
      product: ProductDocument,
      args: any,
      ctx,
      info
    ): Promise<UserDocument> => {
      return (await product.populate('vendor', fields(info)).execPopulate())
        .vendor
    },
  },
  // lastMessage: async (
  //   chat: ChatDocument,
  //   args:any,
  //   ctx,
  //   info
  // ): Promise<MessageDocument> => {
  //   return (await chat.populate('lastMessage', fields(info)).execPopulate())
  //     .lastMessage
  // }
  // }
}

export default resolvers
