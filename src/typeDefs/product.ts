import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    products: [Product!]
    product(id: ID!): Product
  }

  extend type Mutation {
    createProduct(
      name: String!
      type: String
      rate: Int
      qty: Int
      img: String
      time: String
    ): Product @auth
  }

  type Variant {
    id: ID!
    img: [String!]
    price: Float!
    mrp: Float
    discount: Float
    shipping: Float
    size: String
    color: String
    trackInventry: String!
    stock: Float
    unit: String
    weight: Float
    sku: String
    barcode: String
    sameImages: Boolean
    active: Boolean
    enableUnitPrice: Boolean
    saleFromDate: String
    saleToDate: String
    createdAt: String!
    updatedAt: String!
  }

  type Product {
    id: ID!
    name: String
    slug: String
    sku: String
    group: String
    img: String
    enableZips: Boolean
    zips: [String!]
    category: Category
    parentCategory: Category
    categories: [Category!]
    description: String
    status: String
    type: String
    qty: Int
    rate: Int
    time: String
    daily: Boolean
    features: [String]
    keyFeatures: [Feature]
    vendor: User!
    active: Boolean
    meta: Meta
    badge: Badge
    stats: Stats
    related: [Product!]
    createdAt: String!
    updatedAt: String!
  }

  type Meta {
    info: String
    title: String
    description: String
    keywords: String
  }

  type Badge {
    recommended: Boolean
    hot: Boolean
    sale: Boolean
    new: Boolean
    featured: Boolean
    approved: Boolean
  }

  type Stats {
    position: Float
    popularity: Float
    sales: Int
    ratings: Float
    reviews: Int
  }
`
