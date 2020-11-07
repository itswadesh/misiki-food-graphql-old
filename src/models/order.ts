import mongoose, { Schema } from 'mongoose'
import { OrderDocument } from '../types'
import { getOrderPrefix } from '../utils';
const autoIncrementModelID = require('./counterModel');

const { ObjectId } = Schema.Types

const orderSchema = new Schema(
  {
    orderNo: String,
    cartId: String,
    otp: String,
    user: {
      firstName: String,
      lastName: String,
      address: Object,
      phone: String,
      id: { type: ObjectId, ref: 'User' },
    },
    location: {
      city:String,
      coords: { lat: Number, lng: Number },
      state: String,
      zip: Number,
    },
    address: {
      email: String,
      firstName: String,
      lastName: String,
      address: String,
      town: String,
      district: String,
      city: String,
      country: String,
      state: String,
      coords: { lat: Number, lng: Number },
      zip: Number,
      phone: String,
      active: { type: Boolean, default: true },
      user: { type: ObjectId, ref: 'User' },
    },
    payment: {
      type: Object,
      default: {
        method: 'COD',
        status: 'pending',
        amount: 0,
        currency: 'INR',
        refund_status: null,
        captured: false,
        email: null,
        contact: null,
        fee: 0,
        tax: 0,
        error_code: null,
        error_description: null,
        created_at: new Date(),
        payment_order_id: null,
      },
    },
    amount: {
      qty: Number,
      subtotal: Number,
      tax: { cgst: Number, sgst: Number, igst: Number },
      discount: Number,
      shipping: Number,
      total: Number,
      currency: String,
      exchange_rate: Number,
      offer: Object,
    },
    coupon: Object,
    items: [
      {
        pid: { type: ObjectId, ref: 'Product' },
        name: String,
        sku: String,
        slug: String,
        description: String,
        img: String,
        qty: Number,
        price: Number,
        time: String,
        subtotal: Number,
        total: Number,
        currency: String,
        reviewed: { type: Boolean, default: false },
        vendor: {
          restaurant: String,
          address: Object,
          phone: String,
          firstName: String,
          lastName: String,
          id: { type: ObjectId, ref: 'User' },
        },
        delivery: {
          type: Object,
          default: { days: 1, received: 0, weight: 0, status: 'Pending' },
        },
        status: { type: String, default: 'Waiting for confirmation' },
      },
    ],
    comment: String,
    cancellationReason: String,
    cancellationComment: String,
    returnComment: String,
    active: { type: Boolean, default: true },
    payment_order_id: String,
    cod_paid: Number,
  },
  { versionKey: false, timestamps: true }
)
orderSchema.index({
  '$**': 'text',
})
orderSchema.pre('save', async function (next) {
  let vm:any = this
  if (!vm.isNew) {
    next();
    return;
  }
  //getOrderPrefix(vm.city)
  let OrderPre = ''
  try{
  if(vm.location.city && vm.location.city !='' && vm.location.city.length>0)
    OrderPre = vm.location.city.substr(0,1).toUpperCase()
  }catch(e){}
  let orderNo = OrderPre + ('-' + (await autoIncrementModelID('Order'))).slice(-8)
  vm.orderNo = orderNo
  next();
});
export const Order = mongoose.model<OrderDocument>('Order', orderSchema)