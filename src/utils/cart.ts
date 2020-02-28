import { Product, Cart, Coupon } from '../models'
import { CartDocument } from '../types';

export const saveMyCart = async cart: CartDocument => {
  // Silent. no error or success
  if (cart.qty == 0) {
    await Cart.remove({ uid: cart.uid });
  } else {
    let c = await Cart.findOneAndUpdate({ uid: cart.uid }, cart, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }).exec();
  }
};
export const clear = async req => {
  req.session.cart.items = [];
  await calculateSummary(req);
};

//cart merge function
export const merge = async (req, uid: String) => {
  if (!uid) return;
  let dbCart = await Cart.findOne({ uid });
  if (dbCart) {
    let items = dbCart.items;
    if (items.length > 0) {
      const promises = items.map(async i => {
        req.body = { pid: i.product._id, qty: i.qty };
        try {
          await addToCart(req);
        } catch (e) { }
      });
      await Promise.all(promises);
    }
  }

  req.session.cart = req.session.cart || {};
  req.session.cart.uid = uid;
  await saveMyCart(req.session.cart); // email inside cart is mandatory
  return req.session.cart;
};

export const addToCart = async req => {
  // Req required for accessing session
  //   console.log("this session id " + req.sessionID);
  let product: any = {};
  if (!req.session.cart)
    req.session.cart = {
      name: "Arialshop",
      items: [],
      qty: 0,
      shipping: {},
      discount: {},
      subtotal: 0,
      total: 0,
      cart_id: req.session.id
    };
  let items = req.session.cart.items;
  let { pid, vid, qty, replace } = req.body;
  if (replace) {
    req.session.cart.items = items = [];
  }
  if (+qty === 0) {
    // When specifically told to remove from cart
    req.session.cart.items = items = removeFromCartSession(items, pid, vid);
    await calculateSummary(req);
    // saveMyCart(req.session.cart); // email inside cart is mandatory
    return req.session.cart;
  }
  try {
    // Required for stock verification
    product = await Food.findById(pid)
      .select("name slug img rate vendor vendor_name")
      .populate("vendor");
    vid = 0;
    if (!product) {
      req.session.cart.items = items = removeFromCartSession(items, pid, vid);
      throw "Product not found";
    }
  } catch (e) {
    req.session.cart.items = items = removeFromCartSession(items, pid, vid);
    throw { status: 404, message: e.toString() };
  }
  if (!product.vendor || !product.vendor._id || !product.vendor.info)
    throw { status: 501, message: `Restaurant info missing` };
  if (
    req.session.cart.vendor &&
    req.session.cart.vendor.toString() != product.vendor._id.toString() &&
    req.session.cart.items.length > 0
  ) {
    throw {
      status: 501,
      message: `Your cart contain dishes from ${req.session.cart.restaurant}. Do you wish to clear cart and add dishes from ${product.vendor.info.restaurant}?`
    };
  }
  if (!items) return req.session.cart;
  const record = items.find(p => p._id === pid);

  if (record) {
    console.log("Already in cart", pid);
    // If the product is already there in cart increase qty
    record.qty = +record.qty + +qty;
    record.img = product.img;
    record.name = product.name;
    record.slug = product.slug;
    record.rate = product.rate;
    if (+record.qty < 1) {
      // When stock not enough remove it from cart
      items = removeFromCart(items, pid, vid);
    }
  } else {
    console.log("Not in cart", pid);
    if (+product.stock < +qty)
      throw { status: 422, message: "Not enough stock" };
    items.push({
      _id: pid,
      name: product.name,
      slug: product.slug,
      img: product.img,
      rate: product.rate,
      qty
    });
  }
  req.session.cart.vendor = product.vendor._id;
  req.session.cart.vendor_name = product.vendor_name;
  req.session.cart.restaurant = product.vendor.info.restaurant;
  await calculateSummary(req);

  return req.session.cart;
};

const getTotalQty = (items: [CartDocument]): number => {
  let qty = 0;
  items.forEach(item => {
    qty += item.qty;
  });
  return qty;
}

const getSubTotal = (items: [CartDocument]): number => {
  let total = 0;
  for (let item of items) {
    let rate = item.rate;
    let qty = item.qty;
    let amount = rate * qty;
    total += amount;
  }
  return Math.round(total);
};
const applyDiscount = (subtotal: number, value: number, minimumCartValue: number, maxAmount: number, type: string): number => {
  let amount: number = 0;
  if (!subtotal || subtotal < 1 || subtotal < minimumCartValue) return 0;
  if (type == "Percent") amount = subtotal * (value / 100);
  else if (type == "Fixed") amount = value;
  if (amount > maxAmount) amount = maxAmount;
  return amount;
};
// Also called from Coupon Controller
const calculateSummary = (subtotal: number, value: number, minimumCartValue: number, maxAmount: number, type: string): number => {

  if (!req.session.cart) throw { status: 404, message: "Cart is empty" };
  const items = req.session.cart.items;
  req.session.cart.qty = getTotalQty(items);
  let subtotal = (req.session.cart.subtotal = await getSubTotal(items));
  let offer = req.session.cart.discount || {};
  let code = req.params.code || offer.code;
  try {
    const coupon = await Coupon.findOne({ code, active: true }).select(
      "code color type text terms value minimumCartValue maxAmount from to"
    );
    if (coupon && coupon._doc && coupon._doc.value) {
      offer = coupon._doc;
      offer.amount = await applyDiscount(
        subtotal,
        offer.value,
        offer.minimumCartValue,
        offer.maxAmount,
        offer.type
      );
    } else {
      offer = { amount: 0 };
    }
  } catch (e) {
    offer = { amount: 0 };
  }
  let shipping, tax;
  try {
    let setting = await Settings.findOne().select("shipping tax");
    shipping = req.session.cart.shipping = setting.shipping;
    tax = setting.tax;
  } catch (e) {
    throw { status: 404, message: "Invalid Settings" };
  }
  if (!shipping || !shipping.charge) shipping.charge = 0;
  req.session.cart.discount = offer;
  let total = +subtotal - +offer.amount + +shipping.charge;
  req.session.cart.tax = {
    cgst: (total * +tax.cgst) / 100,
    sgst: (total * +tax.sgst) / 100,
    igst: (total * +tax.igst) / 100
  };
  req.session.cart.total =
    total + total * (+tax.cgst + +tax.sgst + +tax.igst) * 0.01;
  if (req.user) {
    req.session.cart.email = req.user.email;
    req.session.cart.phone = req.user.phone;
    req.session.cart.uid = req.user._id;
  }
  if (req.session.hasOwnProperty("id")) {
    req.session.cart.cart_id = req.session.id;
  } else {
    req.session.cart.cart_id = "";
  }
  await saveMyCart(req.session.cart);
};
