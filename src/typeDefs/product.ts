import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    uploads: [File]
    products(
      page: Int
      skip: Int
      limit: Int
      search: String
      city: String
      type: String
      sort: String
      vendor: String
      category: String
      active: String
    ): SearchRes
    myProducts(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      category: String
      active: String
    ): SearchRes
    product(id: ID!): Product
    popular(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): SearchRes
    bestSellers: BestSellers
    productSlug(slug: String!): Product
    search(
      page: Int
      skip: Int
      limit: Int
      city: String
      type: String
      search: String
      sort: String
      q: String
    ): SearchRes
  }

  extend type Mutation {
    deleteProduct(id: ID): Boolean
    createProduct(
      name: String
      description: String
      type: String
      city: String
      price: Int
      stock: Int
      img: String
      time: String
      category: ID
      categories: [String]
    ): Product @auth
    saveProduct(
      id: String
      name: String
      description: String
      type: String
      city: String
      price: Int
      stock: Int
      img: String
      time: String
      category: ID
      categories: [String]
      active: Boolean
      vendor: String
      popularity: Int
      position: Int
      featured: Boolean
      hot: Boolean
      new: Boolean
      sale: Boolean
      recommended: Boolean
      title: String
      metaDescription: String
      keywords: String
  ): Product @auth
    # saveVariant(
    #   id: ID!
    #   name: String!
    #   price: Int
    #   stock: Int
    #   img: String
    # ): Variant @auth
  }

input UserIp{
  firstName: String
  lastName: String
  info:InputInfo
}

  type BestSellers {
    t:[BS],
    t1:[BS],
    t2:[BS],
    t3:[BS],
    t4:[BS] 
  }

  type BS{
    _id: BS1
    count: Int
    amount: Int
    updatedAt: String
  }

type BS1{
    id: ID
    date: String
    name: String
    slug:String
    img: String
    price:Float
    category:Category
    updatedAt:String
    restaurant: String
    time: String
    type: String
    ratings: String
    reviews: String
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
    name: String
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
    id: ID
    name: String
    description: String
    slug: String
    sku: String
    group: String
    img: String
    variants:[Variant]
    enableZips: Boolean
    zips: [String!]
    category: Category
    parentCategory: Category
    categories: [Category!]
    status: String
    type: String
    city: String
    stock: Int
    price: Int
    time: String
    daily: Boolean
    features: [String]
    keyFeatures: [Feature]
    vendor: User
    active: Boolean
    info: String
    title: String
    metaDescription: String
    keywords: String
    recommended: Boolean
    hot: Boolean
    sale: Boolean
    new: Boolean
    featured: Boolean
    position: Float
    popularity: Float
    sales: Int
    ratings: Float
    reviews: Int
    approved: Boolean
    related: [Product!]
    createdAt: String!
    updatedAt: String!
  }

  # type Meta {
  #   info: String
  #   title: String
  #   description: String
  #   keywords: String
  # }

  # type Badge {
  #   recommended: Boolean
  #   hot: Boolean
  #   sale: Boolean
  #   new: Boolean
  #   featured: Boolean
  #   approved: Boolean
  # }

  # type Stats {
  #   position: Float
  #   popularity: Float
  #   sales: Int
  #   ratings: Float
  #   reviews: Int
  # }
`
