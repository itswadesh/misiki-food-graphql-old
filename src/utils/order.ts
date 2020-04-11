import { Types } from 'mongoose'
import {
  getSubTotal,
  getTotalQty,
  saveMyCart,
  getTotal,
  calculateSummary,
  validateCart
} from './cart'
// import { calculateOffers } from './promotions'
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
import { objectId } from '../validation'
import { UserInputError } from 'apollo-server-express'

export const getData = async (start: Date, end: Date, q: any) => {
  let data = await Order.aggregate([
    {
      $match: {
        ...q,
        status: { $nin: ['Cancelled'] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    { $unwind: '$items' },
    { $project: { items: 1, createdAt: 1, vendor: 1, updatedAt: 1 } },
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
          price: '$items.price',
          updatedAt: { $max: '$updatedAt' },
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
export const updateStats = async (product: ProductDocument) => {
  const reviews = await Review.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: '$product',
        avg: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ])
  const vendorReviews = await Review.aggregate([
    { $match: { vendor: product.vendor } },
    {
      $group: {
        _id: '$vendor',
        avg: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ])
  await User.findByIdAndUpdate(product.vendor, {
    ratings: Math.round(vendorReviews[0].avg * 10) / 10,
    reviews: vendorReviews[0].count
  })
  const orders = await Order.countDocuments({ 'items.pid': product._id })
  if (reviews.length > 0) {
    await Product.updateOne(
      { _id: product._id },
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
  await validateCart(req)
  await calculateSummary(req) // Validates coupon expiry
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
  let { cart_id, phone, items } = cart
  if (!items || !cart_id) throw new UserInputError('Cart was not found')
  if (!items || items.length < 1) throw new UserInputError('Cart is empty.')
  if (!userId) throw new UserInputError('User not found')

  for (let i of items) {
    // If item not found in cart remove it
    let product: ProductDocument | null = await Product.findById(i.pid)
    if (!product) throw new UserInputError('Product not found')

    if (product.stock - i.qty < 0)
      throw new UserInputError(`Not enough quantity for ${product.name}`)

    if (!product.vendor) throw new UserInputError('Vendor not found')

    let v: UserDocument | null = await User.findById(product.vendor)
      .select('email phone address firstName lastName address info')
      .exec()
    if (!v) throw new UserInputError('Vendor not found')
    if (!v.info || !v.info.restaurant)
      throw new UserInputError('Restaurant info missing')
    const vendor: any = {
      restaurant: v.info.restaurant, // required during aggregation for delivery boy
      email: v.email, // required during aggregation for delivery boy
      phone: v.phone, // required during aggregation for delivery boy
      address: v.address, // required during aggregation for delivery boy
      firstName: v.firstName, // required during aggregation for delivery boy
      lastName: v.lastName, // required during aggregation for delivery boy
      id: v._id
    }
    let delivery = {
      otp: generateOTP(),
      days: 1,
      start: vendor.address && vendor.address.coords,
      finish: address && address.coords
    }
    i.delivery = delivery
    i.vendor = vendor
  }
  let subtotal = await getSubTotal(items)
  let total = await getTotal(req.session.cart)
  let shipping = cart.shipping.charge
  let discount = cart.discount.amount
  let tax = cart.tax
  let qty = getTotalQty(items)
  cart.items = items
  cart.subtotal = subtotal
  cart.total = total
  cart.uid = userId
  cart.qty = qty
  req.session.cart = cart
  saveMyCart(req.session.cart)

  let me: UserDocument | null = await User.findById(userId)
  if (!me) throw new UserInputError('Invalid user')

  const orderDetails = {
    cartId: req.session.cart.cart_id,
    user: {
      firstName: me.firstName,
      lastName: me.lastName,
      address: me.address,
      phone: me.phone,
      id: userId
    },
    payment: { state: 'Pending', method: req.body.paymentMethod },
    platform: 'Mobile',
    orderNo: ORDER_PREFIX + Math.floor(new Date().valueOf() * Math.random()), //shortId.generate();
    address,
    items,
    amount: {
      total,
      subtotal,
      discount,
      shipping,
      qty,
      tax
    },
    coupon: cart.discount
  }
  const o = await Order.create(orderDetails)
  // clear(req)
  // await User.updateOne(
  //   { _id: userId },
  //   { $set: { address } }
  // ).exec() // Save address into user details
  return o
}
