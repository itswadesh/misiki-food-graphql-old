import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    shutter: Boolean
    settings: Setting
    settingsAdmin: Setting
  }
  extend type Mutation {
    saveSettings(
      id:ID!
      websiteName: String
      title: String
      alert: String
      keywords: String
      description: String
      minimumOrderValue:Int
      shipping: ShippingIp
      tax: TaxIp
      shippingMethod: String
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
      orderStatuses: [String]
      paymentStatuses: [String]
      sms: SmsIp
      email: EmailIp
    ): Setting @admin
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

  type Shutter{
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

  type Sms {
    enabled: Boolean
  }

  input SmsIp {
    provider:String
    FAST2SMS_API_KEY:String
    TWILIO_API_KEY:String
    Fast2SMS_OTP_TEMPLATE_ID:Int
    enabled: Boolean
  }

  type Setting {
    id:String
    websiteName: String
    shutter: Shutter,
    title: String
    alert: String
    keywords: String
    description: String
    minimumOrderValue:Int
    shipping: Shipping
    tax: Tax
    shippingMethod: String
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
    orderStatuses: [String]
    paymentStatuses: [String]
    sms: Sms
    email: Email
  }
`
