import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    sendPay(chatId: ID!, body: String!): Pay @auth
  }

  type Pay {
    id: ID!
    body: String!
    sender: User!
    createdAt: String!
    updatedAt: String!
  }
`
