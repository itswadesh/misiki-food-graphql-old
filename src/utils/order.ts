import Review from "./../review/review.model";
import FoodOrder from "./../food-order/order.model";
import Food from "./../food/food.model";
const { ObjectId } = require("mongodb");
import Setting from "./../settings/model";
import User from "./../user/user.model";
import { orderPrefix } from "./../../config";
import { clear, getSubTotal, getTotalQty, saveMyCart } from "./cart";
import { calculateOffers } from "./promotions";
import { generateOTP } from './';
export const updateStats = async pid => {
  const reviews = await Review.aggregate([
    { $match: { pid: ObjectId(pid) } },
    {
      $group: {
        _id: "$pid",
        avg: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);
  const orders = await FoodOrder.count({ "item._id": pid });
  if (reviews.length > 0) {
    await Food.updateOne(
      { _id: pid },
      {
        $set: {
          ratings: Math.round(reviews[0].avg * 10) / 10,
          reviews: reviews[0].count,
          sales: orders
        }
      }
    );
  }
};
export const getTotalCount = items => {
  if (!items) return 0;
  else
    return items.length === 0
      ? 0
      : items.reduce((prevVal, elem) => prevVal + elem.qty, 0);
};
export const getSubtotal = (items, discount) => {
  // After discount
  if (items) {
    const sum = items.reduce((subtotal, item) => {
      return subtotal + (item.price || 0) * (item.qty || 1);
    }, 0);
    return discount ? sum - discount : sum;
  } else {
    return 0;
  }
};
export const placeOrder = async req => {
  // if (!req.body.paymentMethod || req.body.paymentMethod == '') {
  //     throw { status: 404, message: 'Payment method not defined' }
  // }
  let settings: any = {};
  try {
    settings = await Setting.findOne();
  } catch (e) {
    throw { status: 404, messaage: "Invalid Settings" };
  }
  let nis = false,
    nisProducts = [],
    items = [],
    product = null,
    delivery_days = 5,
    vendor = { address: { coords: null }, delivery_days: 0 };

  if (settings.shipping.delivery_days) {
    delivery_days = settings.shipping.delivery_days;
  }
  if (
    !req.session ||
    !req.session.cart ||
    !req.session.cart.items ||
    req.session.cart.items.length == 0
  ) {
    throw { status: 404, message: "No items in cart" };
  }
  for (let i of req.session.cart.items) {
    try {
      product = await Food.findById(i._id);
      vendor = await User.findOne({
        _id: product.vendor,
        role: "chef"
      }).select("address delivery_days");
    } catch (e) {
      req.session.cart.items = items = items.filter(r => {
        return r._id != i._id;
      });
      let subtotal = await getSubTotal(items);
      let total = subtotal;
      let shipping = { method: settings.shipping.method, amount: 0 };
      req.session.cart.items = items;
      req.session.cart.qty = getTotalQty(items);
      req.session.cart.subtotal = subtotal;
      req.session.cart.total = total;
      req.session.cart.email = req.user.email;
      saveMyCart(req.session.cart);
      continue;
    }

    if (product.stock - i.qty < 0) {
      nisProducts.push(i);
      nis = true;
      // await cart.saveToWishlist({ product, user: req.user }, req, res)
      continue;
    } else {
      items.push({
        name: i.name,
        sku: i.sku,
        _id: i._id,
        slug: i.slug,
        description: i.description,
        img: i.img,
        qty: i.qty,
        rate: i.rate,
        total: i.subtotal,
        currency: "₹ ",
        url: product.url,
        vendor_id: product.vendor_id,
        vendor_email: product.vendor_email,
        vendor_name: product.vendor_name,
        delivery_days: delivery_days
      });
      // Update stock after payment confirmation
      nis = false;
    }
  }

  if (nis) {
    throw { status: 422, message: "Not enough stock" };
  }
  let user = req.user || {};
  let rq = {
    body: {
      paymentMethod: req.body.paymentMethod,
      items: req.session.cart.items,
      qty: req.session.cart.qty,
      total: req.session.cart.total
    },
    user: { _id: user._id }
  };
  let promo: any = await calculateOffers(rq);
  let uid = null,
    phone = null,
    email = null,
    active = null;
  if (req.user) {
    uid = req.user._id;
    phone = req.user.phone;
    email = req.user.email;
    active = req.user.active;
  } else if (req.body.address) {
    // Guest checkout
    uid = 0;
    phone = req.body.address.phone;
    email = req.body.address.email;
    active = true;
  } else {
    // No address specified by user
    throw { status: 404, message: "Please specify your address" };
  }
  let delivery
  if (vendor) {
    delivery = { otp: generateOTP(), days: vendor.delivery_days, start: vendor.address.coords, finish: req.body.address.coords }
  }
  const orderDetails = {
    uid,
    phone,
    email, // id change on every user creation hence email is used
    payment: { state: "Pending", method: req.body.paymentMethod },
    platform: req.body.platform,
    orderNo: orderPrefix + Math.floor(new Date().valueOf() * Math.random()), //shortId.generate();
    address: req.body.address,
    items,
    shipping: settings.shipping,
    qty: req.session.cart.qty,
    amount: {
      total: req.session.cart.total,
      subtotal: req.session.cart.subtotal,
      discount: req.session.cart.discount,
      shipping: req.session.cart.shipping,
      qty: req.session.cart.qty,
      tax: 0,
      offer: promo.details
    },
    delivery
  };
  try {
    const o = await FoodOrder.create(orderDetails);
    // clear(req)
    await User.updateOne(
      { _id: req.user._id },
      { $set: { address: req.body.address } }
    ); // Save address into user details
    if (active && email) {
      // const ec = new EmailClass()
      // ec.emailWithPdf({
      //   to: settings.email.printers,
      //   subject: settings.websiteName + ': New Order #' + o.orderNo,
      //   emailTemplate: 'blank',
      //   context: o,
      //   attachmentTemplate: 'templates/invoice/gst.html',
      //   pdfExportPath: 'exports/invoice/' + req.user.phone + '-' + o.orderNo + '.pdf',
      //   attachmentFileName: 'Invoice ' + req.user.phone + '-' + o.orderNo + '.pdf'
      // })
      // sms({ phone: o.vendor.phone, msg: `Order accepted for ${o.qty} ${o.item.name}.\r\nAmount to pay: Rs${o.amount.total}\r\nDelivery boy will reach you in 30 mins` })
      updateStats(req.body.pid);
      // this.vendorEmails(o) // TODO: Enable this to send emails to corresponding vendors
    }
    return o;
  } catch (e) {
    throw { status: 500, message: e.toString() };
  }
};
