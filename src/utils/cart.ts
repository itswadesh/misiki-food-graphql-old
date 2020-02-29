import { Product, Cart, Coupon, Setting } from '../models'
import {
  CartDocument,
  Request,
  ProductDocument,
  SettingDocument
} from '../types'
import { UserInputError } from 'apollo-server-express'

export const saveMyCart = async (cart: CartDocument) => {
  const { qty, uid } = cart
  // Silent. no error or success
  if (qty == 0) {
    await Cart.remove({ uid })
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
  if (!req.session.cart)
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
  if (replace) {
    items = []
  }
  if (+qty === 0) {
    // When specifically told to remove from cart
    items = removeFromCartSession(items, pid, vid)
    await calculateSummary(req)
    // saveMyCart(req.session.cart); // email inside cart is mandatory
    return req.session.cart
  }
  try {
    // Required for stock verification
    const product = await Product.findById(pid)
      .select('name slug img rate vendor vendor_name')
      .populate('vendor')
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
  const { _id, info, name, slug, img, rate } = product
  if (!_id || !info) throw new UserInputError('Restaurant info missing')
  if (
    req.session.cart.vendor &&
    req.session.cart.vendor.toString() != _id.toString() &&
    items.length > 0
  ) {
    throw new UserInputError(
      `Your cart contain dishes from ${req.session.cart.restaurant}. Do you wish to clear cart and add dishes from ${info.restaurant}?`
    )
  }
  const record = items.find((p: ProductDocument) => p._id === pid)

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
    items.push({ pid, name, slug, img, rate, qty })
  }

  await calculateSummary(req)

  return req.session.cart
}

export const removeFromCartSession = async (
  items: [CartDocument],
  pid: string,
  vid: string
) => {
  for (var i = 0; i < items.length; i++) {
    if (items[i]._id === pid) {
      items.splice(i, 1)
    }
  }
  return items
}

export const getTotalQty = (items: [CartDocument]): number => {
  let qty = 0
  items.forEach(item => {
    qty += item.qty
  })
  return qty
}

export const getSubTotal = (items: [CartDocument]): number => {
  let total = 0
  for (let item of items) {
    let rate = item.rate
    let qty = item.qty
    let amount = rate * qty
    total += amount
  }
  return Math.round(total)
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
export const calculateSummary = async (req: Request) => {
  const { session } = req
  const { cart, userId, id } = session
  if (!cart) throw new UserInputError('Cart is empty')
  let { items, offer } = cart
  let code: string = offer.code
  cart.qty = getTotalQty(items)
  let subtotal = (cart.subtotal = await getSubTotal(items))
  try {
    const coupon = await Coupon.findOne({ code, active: true })
      .select(
        'code color type text terms value minimumCartValue maxAmount from to'
      )
      .exec()
    if (coupon && coupon.value) {
      offer = coupon
      offer.amount = await applyDiscount(
        subtotal,
        offer.value,
        offer.minimumCartValue,
        offer.maxAmount,
        offer.type
      )
    } else {
      offer = { amount: 0 }
    }
  } catch (e) {
    offer = { amount: 0 }
  }
  let shipping, tax
  let setting = (await Setting.findOne({})
    .select('shipping tax')
    .exec()) || { shipping: { charge: 0 }, tax: { cgst: 0, sgst: 0, igst: 0 } }
  shipping = cart.shipping = setting.shipping
  if (!shipping || !shipping.charge) shipping.charge = 0
  cart.discount = offer
  let total = +subtotal - +offer.amount + +shipping.charge
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
