import { Product, Cart, Coupon, Setting } from '../models'
import {
  CartDocument,
  Request,
  ProductDocument,
  CartItemDocument,
  SettingsDocument,
} from '../types'
import { UserInputError } from 'apollo-server-express'

export const saveMyCart = async (cart: CartDocument) => {
  const { qty, user } = cart
  // Silent. no error or success
  if (qty == 0) {
    await Cart.deleteOne({ user })
  } else {
    let c = await Cart.findOneAndUpdate({ user }, cart, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }).exec()
  }
}

export const clearCart = async (req: Request) => {
  req.session.cart.items = []
  await calculateSummary(req)
}

//cart merge function
export const merge = async (req: Request) => {
  const user = req.session.userId
  if (!user) return
  let dbCart = await Cart.findOne({ user })
  if (dbCart) {
    let items = dbCart.items
    if (items.length > 0) {
      const promises = items.map(async (i) => {
        await addToCart(req, {
          pid: i.pid,
          vid: i.vid,
          options: i.options,
          vendor: i.vendor,
          qty: i.qty,
        })
      })
      await Promise.all(promises)
    }
  }

  req.session.cart = req.session.cart || {}
  req.session.cart.user = user
  await saveMyCart(req.session.cart) // email inside cart is mandatory
  return req.session.cart
}

export const addToCart = async (
  req: Request,
  { pid, vid, qty, options, replace }: any
) => {
  vid = pid
  if (options != undefined) options = JSON.parse(options)
  else options = []
  // Decided to stick to string version because its easy for both front and backend
  // if (options) {
  //   let optn: any
  //   optn = options
  //   if (optn) optn = Object.entries(optn)
  //   else optn = []
  //   options = []
  //   for (let o of optn) {
  //     options.push({ name: o[0], val: o[1] })
  //   }
  // } else {
  //   options = []
  // }

  // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', options)
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
      cart_id: req.session.id,
    }
  let items = req.session.cart.items
  // if (replace) items = req.session.cart.items = []

  if (+qty === 0) {
    // When specifically told to remove from cart
    items = removeFromCartSession(items, pid, vid, options)
    await calculateSummary(req)
    // saveMyCart(req.session.cart); // email inside cart is mandatory
    return req.session.cart
  }
  try {
    // Required for stock verification
    product = await Product.findById(pid)
      .select('name slug img price time vendor stock')
      .populate('vendor')
    // vid = 0
    if (!product) {
      items = removeFromCartSession(items, pid, vid, options)
      const code = req.session.cart.discount && req.session.cart.discount.code
      await calculateSummary(req, code)
      return req.session.cart
    }
  } catch (e) {
    items = removeFromCartSession(items, pid, vid, options)
    throw new UserInputError(e.toString())
  }
  if (!product) throw new UserInputError('Product not found')
  const { name, slug, img, price, time, vendor } = product
  // if (!_id || !vendor || !vendor.info) throw new UserInputError('store info missing')
  // if (
  //   req.session.cart.vendor &&
  //   req.session.cart.vendor._id != vendor._id &&
  //   items.length > 0
  // )
  //   throw new UserInputError(
  //     `Your cart contain dishes from ${req.session.cart.vendor.info.store}. Do you wish to Cart cart and add dishes from ${vendor.info.store}?`
  //   )ObjectId("5ea4351c880b0b23119f4c1d")
  const record =
    items.find((p: CartItemDocument) => {
      // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', p.vid, vid)
      const pv = p.pid === pid && p.vid == vid
      let o: any = JSON.parse(p.options || '{}')
      let matched = true
      for (let k in o) {
        // console.log('oooooooooo', k, o[k], options[k])
        if (o[k] !== options[k]) {
          matched = false
          continue
        }
      }
      return pv && matched
    }) || {}

  // console.log('Record............', req.session.cart.items)
  if (+product.stock < +record.qty + qty && +qty > 0)
    throw new UserInputError('Not enough stock')

  if (record.qty) {
    // console.log('if record already exist', pid, vid, qty)
    // console.log('Not in cart', options)
    // If the product is already there in cart increase qty
    // if (+record.qty < 2) qty = 1
    record.qty = +record.qty + +qty
    if (+record.qty < 1) {
      // When stock not enough remove it from cart
      items = removeFromCartSession(items, pid, vid, options)
    }
  } else if (qty > 0) {
    // console.log('First time ', pid, vid, qty)
    items.push({
      pid,
      vid,
      options: JSON.stringify(options),
      vendor,
      name,
      slug,
      img,
      price,
      qty,
      time,
    })
  }
  // console.log('Last Step of addToCart', req.session.cart.items)
  // req.session.cart.items = []
  // req.session.cart.vendor = vendor
  const code = req.session.cart.discount && req.session.cart.discount.code
  await calculateSummary(req, code)

  return req.session.cart
}

export const removeFromCartSession = async (
  items: [CartItemDocument],
  pid: string,
  vid: string,
  options: string
) => {
  for (var i = 0; i < items.length; i++) {
    if (items[i].pid === pid && items[i].vid === vid) {
      items.splice(i, 1)
    }
  }
  return items
}

export const getTotalQty = (items: Array<CartItemDocument>): number => {
  let qty = 0
  items.forEach((item) => {
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
    igst: (total * +tax.igst) / 100,
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
  if (type == 'Percent') amount = Math.floor(subtotal * (value / 100))
  else if (type == 'Fixed') amount = value
  if (amount > maxAmount) amount = maxAmount
  return amount
}

// Also called from Coupon Controller
export const validateCart = async (req: Request) => {
  const { session } = req
  if (!session) throw new UserInputError('Cart not initiated')
  const { cart } = session
  if (!cart) throw new UserInputError('Cart is empty')
  let { items } = cart
  if (!items || items.length < 1) throw new UserInputError('No items in cart')
  cart.qty = getTotalQty(items)
  let subtotal = (cart.subtotal = await getSubTotal(items))
  const setting: any = (await Setting.findOne({})
    .select('shipping tax minimumOrderValue')
    .exec()) || {
    minimumOrderValue: 0,
    shipping: { charge: 0 },
    tax: { cgst: 0, sgst: 0, igst: 0 },
  }
  if (subtotal < setting.minimumOrderValue)
    throw new UserInputError('Min order value is ' + setting.minimumOrderValue)
}

export const validateCoupon = async (
  cart: CartDocument,
  code?: string,
  silent?: boolean
) => {
  cart.qty = getTotalQty(cart.items)
  let subtotal = (cart.subtotal = await getSubTotal(cart.items))
  let coupon = await Coupon.findOne({
    code,
    active: true,
    validFromDate: { $lte: new Date() },
    validToDate: { $gte: new Date() },
  })
    .select(
      'code color type text terms value minimumCartValue amount maxAmount validFromDate validToDate'
    )
    .exec()
  if (code && !silent) {
    if (!coupon) throw new UserInputError('The selected coupon is expired.')
    // code is required here because when no coupon is applied this should not throw error
    else if (coupon.minimumCartValue > cart.subtotal)
      throw new UserInputError(
        'Can not apply coupon, add some more items to cart.'
      ) // code is required here because when no coupon is applied this should not throw error
  }

  if (coupon && coupon.value) {
    coupon.amount = await applyDiscount(
      cart.subtotal,
      coupon.value,
      coupon.minimumCartValue,
      coupon.maxAmount,
      coupon.type
    )
    return coupon
  } else {
    return { amount: 0 }
  }
}

export const calculateSummary = async (req: Request, code?: string) => {
  // Other validations moved to separate function named validateCart because when cart is cleared, validate cart will throw error of minimumordervalue + cart is empty
  const { session } = req
  const { cart, userId, id } = session
  if (!cart) throw new UserInputError('No items in cart')
  let { items } = cart
  cart.qty = getTotalQty(items)
  let subtotal = (cart.subtotal = await getSubTotal(items))
  let shipping,
    tax,
    minimumOrderValue = 0
  const setting: any = (await Setting.findOne({})
    .select('shipping tax minimumOrderValue')
    .exec()) || {
    minimumOrderValue: 0,
    shipping: { charge: 0 },
    tax: { cgst: 0, sgst: 0, igst: 0 },
  }
  // Can not use try catch here, it will not fire the following UserInputError
  const discount = await validateCoupon(cart, code) // 3rd param true= Silent no error
  shipping = cart.shipping = setting.shipping
  if (!shipping || !shipping.charge) shipping.charge = 0
  cart.discount = discount
  let total = +subtotal - +discount.amount + +shipping.charge
  tax = setting.tax
  cart.tax = {
    cgst: (total * +tax.cgst) / 100,
    sgst: (total * +tax.sgst) / 100,
    igst: (total * +tax.igst) / 100,
  }
  cart.total = total + total * (+tax.cgst + +tax.sgst + +tax.igst) * 0.01
  cart.user = userId
  cart.cart_id = id
  req.session.cart = cart
  await saveMyCart(req.session.cart)
}
