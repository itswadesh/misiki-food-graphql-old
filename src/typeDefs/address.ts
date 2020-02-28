import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    sendAddress(chatId: ID!, body: String!): Address @auth
  }

  type Address {
    id: ID!
    email: String
    firstName: String
    lastName: String
    address: String
    town: String
    city: String
    country: String
    state: String
    coords: String
    zip: Int
    phone: String
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }
`
