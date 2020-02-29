import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    orders: [Order!] @auth
    order(id: ID!): Order @auth
  }

  extend type Mutation {
    create(chatId: ID!, body: String!): Order @auth
  }

  type Order {
    id: ID!
    uid: User!
    orderNo: String!
    amount: Amount!
    address: Address!
    vendor: User
    payment_order_id: String
    cartId: Cart!
    items: [CartItem!]!
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

  type Amount {
    qty: Int
    subtotal: Float
    tax: Float
    discount: Float
    shipping: Float
    total: Float
    currency: String
    exchange_rate: Float
  }
`
