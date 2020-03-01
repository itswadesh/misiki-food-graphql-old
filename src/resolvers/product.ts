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
import { sendMessage, objectId, createProduct } from '../validators'
import { Chat, Message, Product } from '../models'
import { fields, hasSubfields } from '../utils'
import pubsub from '../pubsub'

const MESSAGE_SENT = 'MESSAGE_SENT'

const resolvers: IResolvers = {
  Query: {
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
    createProduct: async (
      root,
      args: {
        name: string
        type: string
        rate: number
        qty: number
        img: string
        time: string
      },
      { req }: { req: Request }
    ): Promise<ProductDocument> => {
      await createProduct.validateAsync(args, { abortEarly: false })

      const { userId } = req.session
      const { name, type, rate, qty, img, time } = args
      const product = await Product.create({
        name,
        type,
        rate,
        qty,
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
