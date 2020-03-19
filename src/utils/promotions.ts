import { Order, User, Product, Promotion } from '../models'

// export const checkPromo = async (
//   condition,
//   user,
//   qty,
//   cartValue,
//   paymentMethod,
//   shippingMethod,
//   items
// ) => {
//   let fo = true
//   let cv = true
//   let cq = true
//   let pm = true
//   let sm = true
//   let c = true
//   let buy2 = true
//   for (let i of condition) {
//     // console.log('condition at CheckPromo', qty, cartValue);
//     if (i.key == '1stOrder') {
//       fo = false
//       // console.log('User...............');
//       if (!user) break
//       let isCustomer = await Order.count({ uid: user._id })
//       if (isCustomer == 0) fo = true
//     } else if (i.key == 'CartValue') {
//       cv = false
//       if (cartValue >= +i.val) {
//         cv = true
//       }
//     } else if (i.key == 'CartQty') {
//       cq = false
//       if (qty >= +i.val) cq = true
//     } else if (i.key == 'PaymentMethod') {
//       pm = false
//       if (paymentMethod == i.val) pm = true
//     } else if (i.key == 'ShippingMethod') {
//       sm = false
//       if (shippingMethod == i.val) sm = true
//     }
//     // else if (i.key == 'Buy2get1') {
//     //   buy2 = false
//     //   let lowest = 100000000
//     //   for (let i of items) {
//     //     if (lowest > i.price)
//     //       lowest = i.price
//     //   }
//     //   if (qty > 2)
//     //     buy2 = true
//     // }
//     else if (i.key == 'Customer') {
//       // console.log('Customer..........................', user._id);
//       c = false
//       let condition = {}
//       try {
//         condition = JSON.parse(i.val)
//       } catch (e) {}
//       if (!user) continue
//       i._id = user._id
//       let isCustomer = await User.findOne(condition).count()
//       if (isCustomer > 0) c = true
//     }
//     // else if (i.key == 'freeShipping') {
//     //   fs = false
//     //   if (shippingMethod == i.val)
//     //     fs = true
//     // }
//     //   else if (i.key == 'cartWeight' && cartValue > o.condition) {
//     //     amount -= val
//     //     details = o
//     //   }
//   }
//   // console.log('focv.............', { fo, cv, cq, pm, sm, c, buy2 });
//   return fo && cv && cq && pm && sm && c && buy2
// }
// export const calculateOffers = async (req:Request) => {
//   let paymentMethod = req.body.paymentMethod
//   let items = req.body.items
//   let qty: Number = req.body.qty
//   let total = +req.body.total
//   let details: any = null
//   let promotions = await Promotion.find({
//     type: 'cart',
//     active: true,
//     validFromDate: { $lte: new Date() },
//     validToDate: { $gte: new Date() }
//   })
//     .select(
//       'name description condition action condition action validFromDate validToDate'
//     )
//     .sort('priority')
//   let { shipping } = await Setting.findOne({}).select('shipping')
//   let amount = total + shipping.charge
//   for (let o of promotions) {
//     let pro = await checkPromo(
//       o.condition,
//       req.user,
//       qty,
//       total,
//       paymentMethod,
//       shipping.method,
//       items
//     )
//     let val = 0
//     if (!pro) continue
//     if (o.action.key == 'FreeShipping' && shipping.charge > 0) {
//       val = shipping.charge
//       details = o
//     } else if (o.action.key == 'Discount') {
//       val =
//         o.action.type == 'Percent'
//           ? (amount * +o.action.val) / 100
//           : +o.action.val
//       details = o
//     } else if (o.action.key == 'Buy2get1') {
//       let lowest = 100000000
//       for (let i of items) {
//         if (lowest > i.price) lowest = i.price
//       }
//       if (qty > 2) val = lowest
//     }
//     amount -= val
//     details = o
//     break
//   }
//   return { amount, details }
// }
