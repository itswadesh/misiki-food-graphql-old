import { Product, Cart, Coupon, Setting } from '../models'
import {
  CartDocument,
  Request,
  ProductDocument,
  CartItemDocument,
  SettingsDocument
} from '../types'
import { UserInputError } from 'apollo-server-express'

export const saveMyCart = async (cart: CartDocument) => {
  const { qty, uid } = cart
  // Silent. no error or success
  if (qty == 0) {
    await Cart.deleteOne({ uid })
  } else {
    let c = await Cart.findOneAndUpdate({ uid }, cart, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }).exec()
  }
}

export const clear = async (req: Request) => {
  req.session.cart.items = []
  await calculateSummary(req)
}

//cart merge function
export const merge = async (req: Request, uid: String) => {
  if (!uid) return
  let dbCart = await Cart.findOne({ uid })
  if (dbCart) {
    let items = dbCart.items
    if (items.length > 0) {
      const promises = items.map(async i => {
        await addToCart(req, { pid: i.product._id, qty: i.qty })
      })
      await Promise.all(promises)
    }
  }

  req.session.cart = req.session.cart || {}
  req.session.cart.uid = uid
  await saveMyCart(req.session.cart) // email inside cart is mandatory
  return req.session.cart
}

export const addToCart = async (
  req: Request,
  { pid, vid, qty, replace }: any
) => {
  // Req required for accessing session
  //   console.log("this session id " + req.sessionID);
  let product: any = {}
  if (!req.session.cart || !req.session.cart.items)
    req.session.cart = {
      name: 'Arialshop',
      items: [],
      qty: 0,
      shipping: {},
      discount: {},
      subtotal: 0,
      total: 0,
      cart_id: req.session.id
    }
  let items = req.session.cart.items
  // if (replace) items = req.session.cart.items = []

  if (+qty === 0) {
    // When specifically told to remove from cart
    items = removeFromCartSession(items, pid, vid)
    await calculateSummary(req)
    // saveMyCart(req.session.cart); // email inside cart is mandatory
    return req.session.cart
  }
  try {
    // Required for stock verification
    product = await Product.findById(pid).select('name slug img price vendor')
    vid = 0
    if (!product) {
      items = removeFromCartSession(items, pid, vid)
      throw new UserInputError('Product not found')
    }
  } catch (e) {
    items = removeFromCartSession(items, pid, vid)
    throw new UserInputError(e.toString())
  }
  if (!product) throw new UserInputError('Product not found')
  const { name, slug, img, price } = product
  // if (!_id || !vendor || !vendor.info) throw new UserInputError('Restaurant info missing')
  // if (
  //   req.session.cart.vendor &&
  //   req.session.cart.vendor._id != vendor._id &&
  //   items.length > 0
  // )
  //   throw new UserInputError(
  //     `Your cart contain dishes from ${req.session.cart.vendor.info.restaurant}. Do you wish to clear cart and add dishes from ${vendor.info.restaurant}?`
  //   )
  const record = items.find((p: CartItemDocument) => p.pid === pid)
  if (record) {
    console.log('Already in cart', pid)
    // If the product is already there in cart increase qty
    record.qty = +record.qty + +qty
    if (+record.qty < 1) {
      // When stock not enough remove it from cart
      items = removeFromCartSession(items, pid, vid)
    }
  } else {
    console.log('Not in cart', pid)
    if (+product.qty < +qty) throw new UserInputError('Not enough stock')
    items.push({ pid, name, slug, img, price, qty })
  }
  // req.session.cart.vendor = vendor
  const code = req.session.cart.discount && req.session.cart.discount.code
  await calculateSummary(req, code)

  return req.session.cart
}

export const removeFromCartSession = async (
  items: [CartItemDocument],
  pid: string,
  vid: string
) => {
  for (var i = 0; i < items.length; i++) {
    if (items[i].pid === pid) {
      items.splice(i, 1)
    }
  }
  return items
}

export const getTotalQty = (items: Array<CartItemDocument>): number => {
  let qty = 0
  items.forEach(item => {
    qty += item.qty
  })
  return qty
}

export const getSubTotal = (items: Array<CartItemDocument>): number => {
  let total = 0
  for (let item of items) {
    let price = item.price
    let qty = item.qty
    let amount = price * qty
    total += amount
  }
  return Math.round(total)
}

export const getTotal = async (cart: CartDocument) => {
  let subtotal = (cart.subtotal = await getSubTotal(cart.items))
  let discount = cart.discount || {}
  let code = cart.discount.code
  try {
    const coupon = await Coupon.findOne({ code, active: true }).select(
      'code color type text terms value minimumCartValue amount maxAmount from to'
    )
    if (coupon && coupon && coupon.value) {
      discount = coupon
      discount.amount = await applyDiscount(
        subtotal,
        discount.value,
        discount.minimumCartValue,
        discount.maxAmount,
        discount.type
      )
    } else {
      discount = { amount: 0 }
    }
  } catch (e) {
    discount = { amount: 0 }
  }
  let shipping, tax
  let setting: SettingsDocument | null = await Setting.findOne()
    .select('shipping tax')
    .exec()
  if (!setting) throw new UserInputError(`Invalid settings`)
  shipping = cart.shipping = setting.shipping
  tax = setting.tax
  if (!shipping || !shipping.charge) shipping.charge = 0
  cart.discount = discount
  let total = +subtotal - +discount.amount + +shipping.charge
  cart.tax = {
    cgst: (total * +tax.cgst) / 100,
    sgst: (total * +tax.sgst) / 100,
    igst: (total * +tax.igst) / 100
  }
  return (cart.total =
    total + total * (+tax.cgst + +tax.sgst + +tax.igst) * 0.01)
}

export const applyDiscount = (
  subtotal: number,
  value: number,
  minimumCartValue: number,
  maxAmount: number,
  type: string
): number => {
  let amount: number = 0
  if (!subtotal || subtotal < 1 || subtotal < minimumCartValue) return 0
  if (type == 'Percent') amount = subtotal * (value / 100)
  else if (type == 'Fixed') amount = value
  if (amount > maxAmount) amount = maxAmount
  return amount
}

// Also called from Coupon Controller
export const calculateSummary = async (req: Request, code?: string) => {
  const { session } = req
  const { cart, userId, id } = session
  if (!cart) throw new UserInputError('Cart is empty')
  let { items, discount } = cart
  cart.qty = getTotalQty(items)
  let subtotal = (cart.subtotal = await getSubTotal(items))
  try {
    const coupon = await Coupon.findOne({ code, active: true })
      .select('code color type text terms value minimumCartValue amount maxAmount from to')
      .exec()
    if (coupon && coupon.value) {
      discount = coupon
      discount.amount = await applyDiscount(
        subtotal,
        discount.value,
        discount.minimumCartValue,
        discount.maxAmount,
        discount.type
      )
    } else {
      discount = { amount: 0 }
    }
  } catch (e) {
    discount = { amount: 0 }
  }
  let shipping, tax
  let setting = (await Setting.findOne({})
    .select('shipping tax')
    .exec()) || { shipping: { charge: 0 }, tax: { cgst: 0, sgst: 0, igst: 0 } }
  shipping = cart.shipping = setting.shipping
  if (!shipping || !shipping.charge) shipping.charge = 0
  cart.discount = discount
  let total = +subtotal - +discount.amount + +shipping.charge
  tax = setting.tax
  cart.tax = {
    cgst: (total * +tax.cgst) / 100,
    sgst: (total * +tax.sgst) / 100,
    igst: (total * +tax.igst) / 100
  }
  cart.total = total + total * (+tax.cgst + +tax.sgst + +tax.igst) * 0.01
  cart.uid = userId
  cart.cart_id = id
  req.session.cart = cart
  await saveMyCart(req.session.cart)
}
