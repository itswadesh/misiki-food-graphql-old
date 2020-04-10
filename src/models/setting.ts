import mongoose, { Schema } from 'mongoose'
import { SettingsDocument } from '../types'

const { ObjectId } = Schema.Types

const settingSchema = new Schema(
  {
    websiteName: String,
    title: String,
    alert: String,
    keywords: String,
    description: String,
    homeMeta1: String,
    homeMeta2: String,
    homeMeta3: String,
    homeMeta4: String,
    listingMeta: String,
    detailMeta: String,
    minimumOrderValue: { type: Number, default: 0 },
    shipping: { charge: Number, free: Number, method: String },
    tax: {
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 }
    },
    currency_code: String,
    currency_symbol: String,
    open_graph_image: String,
    shippingMethod: String,
    shopEmail: String,
    shopPhone: String,
    shopAddress: String,
    country: String,
    language: String,
    logo: String,
    logoDark: String,
    logoMobile: String,
    logoMobileDark: String,
    favicon: String,
    CDN_URL: String,
    demo: Boolean,
    pageSize: Number,
    review: {
      enabled: { type: Boolean, default: true },
      moderate: { type: Boolean, default: false }
    },
    product: { moderate: false },
    GOOGLE_MAPS_API: String,
    facebook: String,
    twitter: String,
    google: String,
    instagram: String,
    enableZips: Boolean,
    closed: Boolean,
    closedMessage: String,
    zips: Array,
    userRoles: { type: Array, default: ['user', 'vendor', 'manager', 'admin'] }, // This should be in ascending order of authority. e.g. In this case guest will not have access to any other role, where as admin will have the role of guest+user+vendor+manager+admin
    orderStatuses: {
      type: Array,
      default: [
        'Received',
        'Order Placed',
        'Order Accepted',
        'Order Executed',
        'Shipped',
        'Delivered',
        'Not in Stock',
        'Cancellation Requested',
        'Cancelled'
      ]
    },
    paymentStatuses: { type: Array, default: ['Pending', 'Cancelled', 'Paid'] },
    paymentMethods: {
      type: Array,
      default: ['Stripe', 'PayPal', 'COD', 'Instamojo']
    },
    returnReasons: {
      type: Array,
      default: [
        { val: 'DEFECTIVE_PRODUCT', name: 'Item or part defective' },
        {
          val: 'DAMAGED_PRODUCT',
          name: 'Item or part was broken/damaged on arrival'
        },
        { val: 'SIZE_FIT_ISSUES', name: 'Size fit issue' },
        { val: 'QUALITY_ISSUES', name: 'Quality issue' },
        { val: 'MISSHIPMENT', name: 'Received a different item' },
        { val: 'COLOR_STYLE_ISSUES', name: 'Color style issue' },
        { val: 'MISSING_ITEM', name: 'Item missing' },
        { val: 'DEAD_ON_ARRIVAL', name: 'Item was dead on arrival' }
      ]
    },
    sms: {
      enabled: Boolean,
      provider: { type: String, default: 'twilio' },
      TWILIO_API_KEY: String
    },
    email: {
      enabled: Boolean,
      SENDGRID_API_KEY: String,
      from: { type: String, default: 'CodeNx.com <no-reply@litekart.in>' },
      printers: { type: Array, default: ['CodeNx.com <print@hpeprint.com>'] },
      cc: { type: Array, default: ['Swadesh Behera <swadesh@litekart.in>'] },
      bcc: { type: Array, default: ['Customer Service <care@litekart.in>'] }
    },
    login: {
      FACEBOOK_ID: String,
      FACEBOOK_SECRET: String,
      TWITTER_ID: String,
      TWITTER_SECRET: String,
      GOOGLE_ID: String,
      GOOGLE_SECRET: String,
      GITHUB_ID: String,
      GITHUB_SECRET: String,
      LINKEDIN_ID: String,
      LINKEDIN_SECRET: String
    },
    payment: {
      STRIPE_APIKEY: String,
      PAYPAL_MODE: { type: String, default: 'sandbox' },
      PAYPAL_CLIENT_ID: String,
      PAYPAL_CLIENT_SECRET: String,
      INSTAMOJO_SANDBOX_MODE: { type: Boolean, default: true },
      INSTAMOJO_API_KEY: String,
      INSTAMOJO_AUTH_TOKEN: String
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export const Setting = mongoose.model<SettingsDocument>('Setting', settingSchema)
