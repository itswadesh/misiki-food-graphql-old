import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    orders: [Order!] @auth
    order(id: ID!): Order @auth
    myToday: Order @auth
    todaysSummary: Order @auth
    myCustomers(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): orderRes @auth
  }

  extend type Mutation {
    create(chatId: ID!, body: String!): Order @auth
    checkout(qty: String!, pid: String!): Boolean @auth
  }

  type orderRes {
    data: [Order]
    count: Int
    pageSize: Int
    page: Int
  }

  type Order {
    id: ID!
    uid: User!
    otp: String
    orderNo: String!
    amount: Amount!
    address: Address!
    vendor: User
    payment_order_id: String
    cartId: Cart!
    items: [CartItem!]!
    status: String
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
