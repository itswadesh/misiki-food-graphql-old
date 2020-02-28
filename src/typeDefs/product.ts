import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    products: Product
    product(id: ID!): Product
  }

  extend type Mutation {
    createProduct(name: String!): Product
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
    name: String!
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
    stock: Int
    rate: Int
    time: String
    daily: Boolean
    meta: String
    metaTitle: String
    metaDescription: String
    metaKeywords: String
    features: [String]
    featured: Boolean
    position: Float
    keyFeatures: [Feature]
    popularity: Float
    uid: User!
    active: String
    approved: Boolean
    recommended: Boolean
    hot: Boolean
    sale: Boolean
    new: Boolean
    ratings: Int
    reviews: Int
    sales: Int
    related: [Product!]
    createdAt: String!
    updatedAt: String!
  }
`
