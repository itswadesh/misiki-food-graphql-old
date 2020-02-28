import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    sendOrder(chatId: ID!, body: String!): Order @auth
  }

  type Order {
    id: ID!
    uid: User
    orderNo: String
    amount: Float
    address: Address
    vendor: User
    payment_order_id: String
    cartId: Cart
    items: [Product!]
    Status: String
    delivery: String
    comment: String
    cancellationReason: String
    cancellationComment: String
    returnComment: String
    payment: String
    reviewed: Boolean
    createdAt: String!
    updatedAt: String!
  }
`
