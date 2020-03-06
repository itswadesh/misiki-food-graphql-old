import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    settings: Setting
    settingsAdmin: Setting
  }
  extend type Mutation {
    updateSettings(
      websiteName: String
      closeMessage: String
      title: String
      alert: String
      keywords: String
      description: String
      # shipping: { charge: Int, free: Int, method: String },
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
      banners: BannersIp
    ): Setting @auth
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

  type Sms {
    enabled: Boolean
  }

  input SmsIp {
    enabled: Boolean
  }

  input BannersIp {
    slider: [HeroIp]
    offers: [HeroIp]
    deals: [HeroIp]
    hero: HeroIp
    hero1: HeroIp
    hero2: HeroIp
    hero3: HeroIp
    hero4: HeroIp
    hero5: HeroIp
    background: HeroIp
  }
  type Banners {
    slider: [Hero]
    offers: [Hero]
    deals: [Hero]
    hero: Hero
    hero1: Hero
    hero2: Hero
    hero3: Hero
    hero4: Hero
    hero5: Hero
    background: Hero
  }

  type Hero {
    img: String
    h1: String
    h2: String
    h3: String
    link: String
  }

  input HeroIp {
    img: String
    h1: String
    h2: String
    h3: String
    link: String
  }

  type Setting {
    websiteName: String
    closeMessage: String
    title: String
    alert: String
    keywords: String
    description: String
    # shipping: { charge: Int, free: Int, method: String },
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
    banners: Banners
  }
`
