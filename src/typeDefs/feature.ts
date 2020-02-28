import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    sendFeature(chatId: ID!, body: String!): Review @auth
  }

  type Feature {
    id: ID!
    name: String
    options: [Option]
    key: String
    val: String
    categories: [Category]
    position: Int
    info: String
    slug: String
    isFilter: Boolean
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Option {
    name: String
    value: String
    slug: String
    position: Int
  }
`
