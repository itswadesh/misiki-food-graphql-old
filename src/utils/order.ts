import { Types } from 'mongoose'
import { clear, getSubTotal, getTotalQty, saveMyCart, getTotal } from './cart'
import { calculateOffers } from './promotions'
import { generateOTP } from './'
import { Review, Order, Product, Setting, User } from '../models'
import { ORDER_PREFIX } from './../config'
import {
  PromotionDocument,
  CartDocument,
  ProductDocument,
  Request,
  UserDocument,
  CartItemDocument,
  AddressDocument,
  SettingsDocument
} from '../types'
import { objectId } from '../validators'
import { UserInputError } from 'apollo-server-express'

export const getData = async (start: Date, end: Date, q: any) => {
  let data = await Order.aggregate([
    {
      $match: {}
    },
    { $unwind: '$items' },
    { $project: { items: 1, createdAt: 1, vendor: 1 } },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: '%d-%m-%Y',
              date: '$createdAt',
              timezone: '+0530'
            }
          },
          id: '$items._id',
          img: '$items.img',
          slug: '$items.slug',
          name: '$items.name',
          rate: '$items.rate',
          time: '$items.time',
          type: '$items.type',
          ratings: '$items.ratings',
          reviews: '$items.reviews',
          restaurant: '$vendor.restaurant'
        },
        count: { $sum: '$amount.qty' },
        amount: { $sum: '$amount.subtotal' }
      }
    },
    { $sort: { count: -1 } }
  ])
  return data
}
export const updateStats = async (pid: Types.ObjectId) => {
  await objectId.validateAsync(pid)
  const reviews = await Review.aggregate([
    { $match: { pid } },
    {
      $group: {
        _id: '$pid',
        avg: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ])
  const orders = await Order.count({ 'item._id': pid })
  if (reviews.length > 0) {
    await Product.updateOne(
      { _id: pid },
      {
        $set: {
          ratings: Math.round(reviews[0].avg * 10) / 10,
          reviews: reviews[0].count,
          sales: orders
        }
      }
    )
  }
}

export const placeOrder = async (req: Request, { address, comment }: any) => {
  let setting: SettingsDocument | null = await Setting.findOne().exec()
  if (!setting) throw new UserInputError('Invalid settings')
  if (
    !req.session ||
    !req.session.cart ||
    !req.session.cart.items ||
    req.session.cart.items.length == 0
  )
    throw new UserInputError('No items in cart')

  let { userId, cart } = req.session
  let { items } = cart
  if (!items || items.length < 1)
    throw new UserInputError('Cart is empty.').select('address').exec()
  if (!cart.vendor) throw new UserInputError('Vendor not found')
  let vendor: UserDocument | null = await User.findById(cart.vendor._id)
  if (!vendor) throw new UserInputError('Vendor not found')
  if (!vendor.info || !vendor.info.restaurant)
    throw new UserInputError('Restaurant info missing')

  for (let i of items) {
    // If item not found in cart remove it
    let product: ProductDocument | null = await Product.findById(i.pid)
    if (!product) throw new UserInputError('Product not found')

    if (product.stock - i.qty < 0)
      throw new UserInputError(`Not enough quantity for ${product.name}`)
  }
  let subtotal = await getSubTotal(items)
  let total = await getTotal(req.session.cart)
  let shipping = cart.shipping.charge
  let qty = getTotalQty(items)
  cart.items = items
  cart.subtotal = subtotal
  cart.total = total
  cart.uid = userId
  cart.qty = qty
  req.session.cart = cart
  saveMyCart(req.session.cart)

  let delivery = {
    otp: generateOTP(),
    start: vendor.address && vendor.address.coords,
    finish: address && address.coords
  }

  const orderDetails = {
    cartId: req.session.cart.cart_id,
    uid: userId,
    vendor: {
      restaurant: vendor.info.restaurant, // required during aggregation for delivery boy
      phone: vendor.phone, // required during aggregation for delivery boy
      address: vendor.address, // required during aggregation for delivery boy
      firstName: vendor.firstName, // required during aggregation for delivery boy
      lastName: vendor.lastName, // required during aggregation for delivery boy
      id: vendor._id
    },
    payment: { state: 'Pending', method: req.body.paymentMethod },
    platform: 'Mobile',
    orderNo: ORDER_PREFIX + Math.floor(new Date().valueOf() * Math.random()), //shortId.generate();
    address,
    items,
    amount: {
      total,
      subtotal,
      shipping,
      qty,
      tax: 0
    },
    delivery
  }
  const o = await Order.create(orderDetails)
  // clear(req)
  // await User.updateOne(
  //   { _id: userId },
  //   { $set: { address } }
  // ).exec() // Save address into user details
  return o
}
