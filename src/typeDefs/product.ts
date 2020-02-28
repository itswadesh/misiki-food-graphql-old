import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    sendProduct(chatId: ID!, body: String!): Product @auth
  }

  type Variant {
    id: ID!
    img: [String!]!
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
    sku: String
    group: String
    name: String
    slug: String!
    img: [String]
    enableZips: Boolean
    zips: [String!]
    category: Category
    parentCategory: Category
    categories: [Category!]
    status: String
    brand: Brand
    description: String
    meta: String
    metaTitle: String
    metaDescription: String
    metaKeywords: String
    variants: [Variant]
    features: [String]
    position: Float
    keyFeatures: [Feature]
    popularity: Float
    uid: User!
    active: String
    featured: Boolean
    approved: Boolean
    hot: Boolean
    sale: Boolean
    new: Boolean
    related: [Product!]
    sizechart: String
    validFromDate: String
    validToDate: String
    createdAt: String!
    updatedAt: String!
  }
`
