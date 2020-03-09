import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    orders(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      vendor: String
      user: String
      status: String
    ): orderRes @auth
    order(id: ID!): Order @auth
    myToday: TodaysSummary @auth
    todaysSummary: TodaysSummary @auth
    todaysStatus: todaysStatus @auth
    myCustomers(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): orderRes @auth
    todaysChefs: [TC] @auth
    ordersOfChef(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): orderRes @auth
    pendingOrders(
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

  type TC {
    _id: todaysChefs
    amount: Int
    count: Int
  }

  type todaysChefs {
    id: String
    restaurant: String
    firstName: String
    lastName: String
    address: Address
  }

  type todaysStatus {
    _id: String
    amount: Int
    count: Int
    items: [Order]
  }

  type TodaysSummary {
    _id: String
    count: Float
    amount: Float
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
    orderNo: String
    amount: Amount
    address: Address!
    vendor: Vendor
    payment_order_id: String
    cartId: Cart!
    items: [CartItem!]!
    status: String
    delivery: Delivery
    comment: String
    cancellationReason: String
    cancellationComment: String
    returnComment: String
    payment: Pay
    reviewed: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type Vendor {
    restaurant: String
    id: User
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

  type Delivery {
    otp: String
    finish: Coords
  }
`
