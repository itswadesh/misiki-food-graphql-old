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
      today: Boolean
      status: String
    ): orderRes @auth
    order(id: ID!): Order @auth
    myToday: TodaysSummary @auth
    todaysSummary: TodaysSummary @auth
    delivery: delivery @auth
    deliveryOrders(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
      status: String
    ): myCustomerRes @auth
    myOrders(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
      id: ID
    ): myCustomerRes @auth
    myCustomers(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): myCustomerRes @auth
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
    updateOrder(id: ID!, pid: ID!, status:String): Order @auth
    collectPayment(id: ID!, cod_paid:Int): Boolean @auth
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

  type delivery {
    pending: DeliveryGroup
    out: DeliveryGroup
    cancelled: DeliveryGroup
    delivered: DeliveryGroup
    all: DeliveryGroup
  }

  type DeliveryGroup{
      _id:String
      total: Float
      count: Int
      items: [Order]
  }

  type TodaysSummary {
    _id: String
    count: Float
    amount: Float
    createdAt:String
  }

  type myCustomerRes {
    data: [myCustomer]
    count: Int
    pageSize: Int
    page: Int
  }

  type myCustomer{
    _id:Order
    items:[CartItem]
  }

  type orderRes {
    data: [Order]
    count: Int
    pageSize: Int
    page: Int
  }

  type Order {
    id: ID!
    user: User
    otp: String
    orderNo: String
    amount: Amount
    address: Address
    payment_order_id: String
    cartId: Cart!
    items: [CartItem!]
    delivery: Delivery
    comment: String
    cancellationReason: String
    cancellationComment: String
    returnComment: String
    payment: Payment
    reviewed: Boolean
    createdAt: String
    updatedAt: String
    cod_paid: Int
  }

  type Vendor {
    restaurant: String
    phone: String
    firstName: String
    lastName: String
    address: Address
    id: User
  }

  type Amount {
    qty: Int
    subtotal: Float
    tax: Tax
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
