import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    shutter: Boolean
    worldCurrencies: [String!]
    orderStatuses: [OrderStatus!]
    paymentStatuses: [String!]
    sorts: [NameVal!]
    timesList: [String!]
    userRoles: [String!]
    settings: Setting
    settingsAdmin: Setting
  }
  extend type Mutation {
    closeRestaurant: Boolean
    saveSettings(
      id: ID!
      websiteName: String
      title: String
      alert: String
      keywords: String
      description: String
      minimumOrderValue: Int
      shipping: ShippingIp
      tax: TaxIp
      shopEmail: String
      shopPhone: String
      shopAddress: String
      currency_code: String
      currency_symbol: String
      currency_decimals: Int
      open_graph_image: String
      country: String
      country: String
      language: String
      logo: String
      logoDark: String
      logoMobile: String
      logoMobileDark: String
      favicon: String
      CDN_URL: String
      demo: Boolean
      pageSize: Int
      # product: { moderate: false },
      enableZips: Boolean
      closed: Boolean
      closedMessage: String
      zips: [String]
      orderStatuses: [String]
      paymentStatuses: [String]
      sms: SmsIp
      email: EmailIp
      review: ReviewSettingIp
      product: ProductSettingIp
      login: LoginSettingIp
      GOOGLE_MAPS_API: String
      RAZORPAY_KEY_ID: String
      stripePublishableKey: String
      enableStripe: Boolean
      enableRazorpay: Boolean
      facebook: String
      twitter: String
      google: String
      instagram: String
      enableTax: Boolean
      locationExpiry: Float
    ): Setting @admin @demo
  }

  extend type Subscription {
    settingsUpdated: Setting
  }

  type OrderStatus {
    status: String
    title: String
    body: String
    icon: String
    public: Boolean
    index: Int
  }

  input ProductSettingIp {
    moderate: Boolean
  }

  input LoginSettingIp {
    FACEBOOK_ID: String
    FACEBOOK_SECRET: String
    TWITTER_ID: String
    TWITTER_SECRET: String
    GOOGLE_ID: String
    GOOGLE_SECRET: String
    GITHUB_ID: String
    GITHUB_SECRET: String
  }

  type LoginSetting {
    FACEBOOK_ID: String
    FACEBOOK_SECRET: String
    TWITTER_ID: String
    TWITTER_SECRET: String
    GOOGLE_ID: String
    GOOGLE_SECRET: String
    GITHUB_ID: String
    GITHUB_SECRET: String
  }

  type ProductSetting {
    moderate: Boolean
  }

  input ReviewSettingIp {
    enabled: Boolean
    moderate: Boolean
  }

  type ReviewSetting {
    enabled: Boolean
    moderate: Boolean
  }

  input ShippingIp {
    delivery_days: Int
    charge: Int
    free: Int
    method: String
  }

  type Shipping {
    delivery_days: Int
    charge: Int
    free: Int
    method: String
  }

  type Shutter {
    open: Boolean
    message: String
  }

  input TaxIp {
    cgst: Float
    sgst: Float
    igst: Float
  }

  type Tax {
    cgst: Float
    sgst: Float
    igst: Float
  }

  type Email {
    enabled: Boolean
    from: String
    to: [String]
    cc: [String]
    bcc: [String]
    printers: [String]
  }

  input EmailIp {
    enabled: Boolean
    from: String
    to: [String]
    cc: [String]
    bcc: [String]
    printers: [String]
  }

  type NameVal {
    name: String
    val: String
  }

  input NameValIp {
    name: String
    val: String
  }

  type Sms {
    enabled: Boolean
  }

  input SmsIp {
    provider: String
    FAST2SMS_API_KEY: String
    TWILIO_API_KEY: String
    Fast2SMS_OTP_TEMPLATE_ID: Int
    enabled: Boolean
  }

  type Setting {
    id: String
    websiteName: String
    shutter: Shutter
    title: String
    alert: String
    keywords: String
    description: String
    minimumOrderValue: Int
    shipping: Shipping
    currency_code: String
    open_graph_image: String
    currency_symbol: String
    currency_decimals: Int
    userRoles: [String]
    sorts: [NameVal]
    RAZORPAY_KEY_ID: String
    tax: Tax
    shopEmail: String
    shopPhone: String
    shopAddress: String
    country: String
    language: String
    logo: String
    logoDark: String
    logoMobile: String
    logoMobileDark: String
    favicon: String
    CDN_URL: String
    demo: Boolean
    pageSize: Int
    # product: { moderate: false },
    enableZips: Boolean
    closed: Boolean
    closedMessage: String
    zips: [String]
    orderStatuses: [OrderStatus]
    paymentStatuses: [String]
    sms: Sms
    email: Email
    review: ReviewSetting
    product: ProductSetting
    login: LoginSetting
    GOOGLE_MAPS_API: String
    stripePublishableKey: String
    enableStripe: Boolean
    enableRazorpay: Boolean
    facebook: String
    twitter: String
    google: String
    instagram: String
    enableTax: Boolean
    locationExpiry: Float
  }
`
