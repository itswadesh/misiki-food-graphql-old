import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    brands: [Brand!]
    brand(id: ID!): Brand
  }

  extend type Mutation {
    sendBrand(chatId: ID!, body: String!): Address @auth
  }

  type Brand {
    name: String
    slug: String
    info: String
    parent: String
    img: String
    banner: String
    meta: String
    metaTitle: String
    metaDescription: String
    metaKeywords: String
    user: User
    featured: Boolean
    sizechart: String
    position: Int
    active: Boolean
  }
`
