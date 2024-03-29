import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    hasOrder(product: ID!): Boolean
    validateCart: Boolean
    validateCoupon: Boolean
    allOrders(
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

    # For delivery boy
    todaysStatusSummary: [TodaysSummary] @auth
    todaysSummary: TodaysSummary @auth
    todayTotalAmount: TodaysSummary @auth
    allOrderSummary: TodaysSummary @auth
    todayTotalPaid: TodaysSummary @auth
    paymentsSummary: TodaysSummary @auth

    # For chef
    myTodaysStatusSummary: [TodaysSummary] @auth
    myTodaysSummary: TodaysSummary @auth
    mySummary: TodaysSummary @auth
    myItemsSummaryByName: [TodaysSummary] @auth

    delivery: delivery @auth
    ordersByStatus(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      status: String!
    ): myCustomerRes @auth
    ordersForPickup(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      status: String
      vendor: ID!
    ): myCustomerRes @auth
    myOrders(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
    ): orderRes @auth
    myCustomers(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
    ): myCustomerRes @auth
    todaysChefs: [TC] @auth
    chefSummary: [TC] @auth
    ordersOfChef(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): orderRes @auth
    # pendingOrders(
    #   page: Int
    #   skip: Int
    #   limit: Int
    #   search: String
    #   sort: String
    #   q: String
    # ): orderRes @auth
  }

  extend type Mutation {
    create(chatId: ID!, body: String!): Order @auth
    checkout(
      paymentMethod: String
      address: AddressInput!
      location: AddressInput
    ): Order @auth
    updateOrder(id: ID!, pid: ID!, status: String): Order @auth
    collectPayment(id: ID!, cod_paid: Int): Boolean @auth
  }

  extend type Subscription {
    orderUpdated(id: ID!): Order @auth
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
    phone: String
    status: String
  }

  type delivery {
    pending: DeliveryGroup
    out: DeliveryGroup
    cancelled: DeliveryGroup
    delivered: DeliveryGroup
    all: DeliveryGroup
  }

  type DeliveryGroup {
    _id: String
    total: Float
    count: Int
    items: [Order]
  }

  type TodaysSummary {
    _id: String
    count: Float
    amount: Float
    createdAt: String
    cod_paid: Float
  }

  type myCustomerRes {
    data: [myCustomer]
    count: Int
    pageSize: Int
    page: Int
  }

  type myCustomer {
    _id: Order
    items: [CartItem]
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
    location: Address
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
