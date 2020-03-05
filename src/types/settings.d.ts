import { Document } from 'mongoose'

export interface SettingsDocument extends Document {
  websiteName: string
  closeMessage: { type: string; default: 'Closed 6PM - 10PM' }
  title: string
  alert: string
  keywords: string
  description: string
  homeMeta1: string
  homeMeta2: string
  homeMeta3: string
  homeMeta4: string
  listingMeta: string
  detailMeta: string
  shipping: {
    delivery_days: number
    charge: number
    free: number
    method: string
  }
  tax: {
    cgst: { type: number; default: 0 }
    sgst: { type: number; default: 0 }
    igst: { type: number; default: 0 }
  }
  shippingMethod: string
  shopEmail: string
  shopPhone: string
  shopAddress: string
  country: string
  language: string
  logo: string
  logoDark: string
  logoMobile: string
  logoMobileDark: string
  favicon: string
  CDN_URL: string
  demo: false
  pageSize: number
  review: {
    enabled: { type: boolean; default: true }
    moderate: { type: boolean; default: false }
  }
  product: { moderate: false }
  GOOGLE_MAPS_API: string
  facebook: string
  twitter: string
  google: string
  instagram: string
  enableZips: boolean
  closed: boolean
  closedMessage: string
  zips: [string]
  userRoles: { type: [string]; default: ['user', 'vendor', 'manager', 'admin'] } // This should be in ascending order of authority. e.g. In this case guest will not have access to any other role, where as admin will have the role of guest+user+vendor+manager+admin
  orderStatuses: {
    type: [string]
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
  }
  paymentStatuses: { type: [string]; default: ['Pending', 'Cancelled', 'Paid'] }
  paymentMethods: {
    type: [string]
    default: ['Stripe', 'PayPal', 'COD', 'Instamojo']
  }
  returnReasons: {
    type: [string]
    default: [
      { val: 'DEFECTIVE_PRODUCT'; name: 'Item or part defective' },
      {
        val: 'DAMAGED_PRODUCT'
        name: 'Item or part was broken/damaged on arrival'
      },
      { val: 'SIZE_FIT_ISSUES'; name: 'Size fit issue' },
      { val: 'QUALITY_ISSUES'; name: 'Quality issue' },
      { val: 'MISSHIPMENT'; name: 'Received a different item' },
      { val: 'COLOR_STYLE_ISSUES'; name: 'Color style issue' },
      { val: 'MISSING_ITEM'; name: 'Item missing' },
      { val: 'DEAD_ON_ARRIVAL'; name: 'Item was dead on arrival' }
    ]
  }
  banners: {
    slider: []
    offers: []
    deals: []
    hero: { img: string; h1: string; h2: string; h3: string; link: string }
    hero1: { img: string; h1: string; h2: string; h3: string; link: string }
    hero2: { img: string; h1: string; h2: string; h3: string; link: string }
    hero3: { img: string; h1: string; h2: string; h3: string; link: string }
    hero4: { img: string; h1: string; h2: string; h3: string; link: string }
    hero5: { img: string; h1: string; h2: string; h3: string; link: string }
    background: {
      img: string
      h1: string
      h2: string
      h3: string
      link: string
    }
  }
  sms: {
    enabled: boolean
    provider: { type: string; default: 'twilio' }
    TWILIO_API_KEY: string
  }
  email: {
    enabled: boolean
    SENDGRID_API_KEY: string
    from: { type: string; default: 'CodeNx.com <no-reply@litekart.in>' }
    printers: { type: [string]; default: ['CodeNx.com <print@hpeprint.com>'] }
    cc: { type: [string]; default: ['Swadesh Behera <swadesh@litekart.in>'] }
    bcc: { type: [string]; default: ['Customer Service <care@litekart.in>'] }
  }
  login: {
    FACEBOOK_ID: string
    FACEBOOK_SECRET: string
    TWITTER_ID: string
    TWITTER_SECRET: string
    GOOGLE_ID: string
    GOOGLE_SECRET: string
    GITHUB_ID: string
    GITHUB_SECRET: string
    LINKEDIN_ID: string
    LINKEDIN_SECRET: string
  }
  payment: {
    STRIPE_APIKEY: string
    PAYPAL_MODE: { type: string; default: 'sandbox' }
    PAYPAL_CLIENT_ID: string
    PAYPAL_CLIENT_SECRET: string
    INSTAMOJO_SANDBOX_MODE: { type: boolean; default: true }
    INSTAMOJO_API_KEY: string
    INSTAMOJO_AUTH_TOKEN: string
  }
  q: string
}
