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
  SettingDocument,
  UserDocument,
  CartItemDocument,
  AddressDocument
} from '../types'
import { objectId } from '../validators'
import { UserInputError } from 'apollo-server-express'

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

export const placeOrder = async (
  { req }: { req: Request },
  { address, comment }: any
) => {
  let setting: SettingDocument | null = await Setting.findOne().exec()
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
  if (!items || items.length < 1) throw new UserInputError('Cart is empty.')
  let vendor: UserDocument | null = await User.findOne({
    _id: items[0].product.vendor,
    role: 'chef'
  })
    .select('address')
    .exec()
  if (!vendor) throw new UserInputError('Vendor not found')

  for (let i of items) {
    // If item not found in cart remove it
    let product: ProductDocument | null = await Product.findById(i._id)
    if (!product) throw new UserInputError('Product not found')

    if (product.stock - i.qty < 0)
      throw new UserInputError(`Not enough quantity for ${product.name}`)

    const {
      _id,
      name,
      sku,
      slug,
      img,
      description,
      stock,
      rate,
      subtotal,
      total,
      currency,
      vendor,
      delivery_days
    } = i
    items.push({
      id: _id,
      name,
      sku,
      slug,
      description,
      img,
      stock,
      rate,
      subtotal,
      total,
      currency,
      vendor,
      delivery_days
    })
  }
  let subtotal = await getSubTotal(items)
  let total = await getTotal(req.session.cart)
  let shipping = { method: setting.shipping.method, amount: 0 }
  let qty = getTotalQty(items)
  cart.items = items
  cart.subtotal = subtotal
  cart.total = total
  cart.uid = userId
  cart.qty = qty
  req.session.cart = cart
  saveMyCart(req.session.cart)

  let uid = null,
    phone = null,
    email = null

  let delivery = {
    otp: generateOTP(),
    start: vendor.address.coords,
    finish: address.coords
  }
  const orderDetails = {
    uid,
    phone,
    email, // id change on every user creation hence email is used
    payment: { state: 'Pending', method: req.body.paymentMethod },
    platform: req.body.platform,
    orderNo: ORDER_PREFIX + Math.floor(new Date().valueOf() * Math.random()), //shortId.generate();
    address: req.body.address,
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
  await User.updateOne(
    { _id: userId },
    { $set: { address: req.body.address } }
  ).exec() // Save address into user details
  return o
}
