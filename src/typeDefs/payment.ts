import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    payments(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
    ): PayRes
    payment(id: ID!): Payment @auth
    razorpays: Payment
  }
  extend type Mutation {
    razorpay(address: AddressInput!,location: AddressInput): Payment @auth
    capturePay(payment_id: String!, oid: String!): Order @auth
  }

  type PayRes {
    data: [Payment]
    count: Int
    pageSize: Int
    page: Int
  }

  type Payment {
    id: String
    entity: String
    method: String
    amount: Float
    amount_paid: Float
    amount_due: Float
    currency: String
    status: String
    order_id: String
    invoice_id: String
    international: Boolean
    amount_refunded: Float
    refund_status: String
    captured: Boolean
    description: String
    card_id: String
    bank: String
    wallet: String
    vpa: String
    email: String
    contact: String
    fee: Float
    tax: Float
    error_code: String
    error_description: String
    created_at: String
  }
`
