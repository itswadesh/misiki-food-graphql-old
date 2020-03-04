import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    files: [File]
    uploads: [File]
    products: [Product!]
    product(id: ID!): Product
    search(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): SearchRes
    my(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): SearchRes
  }

  extend type Mutation {
    deleteProduct(id: ID): Boolean
    createProduct(
      name: String!
      description: String
      type: String
      rate: Int
      stock: Int
      img: String
      time: String
    ): Product @auth
    updateProduct(
      id: ID!
      name: String!
      description: String
      type: String
      rate: Int
      stock: Int
      img: String
      time: String
    ): Product @auth
  }

  type SearchRes {
    data: [Product]
    count: Int
    pageSize: Int
    page: Int
  }
  type File {
    filename: String
    mimetype: String
    encoding: String
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
    description: String
    slug: String
    sku: String
    group: String
    img: String
    enableZips: Boolean
    zips: [String!]
    category: Category
    parentCategory: Category
    categories: [Category!]
    status: String
    type: String
    stock: Int
    rate: Int
    time: String
    daily: Boolean
    features: [String]
    keyFeatures: [Feature]
    vendor: User
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
