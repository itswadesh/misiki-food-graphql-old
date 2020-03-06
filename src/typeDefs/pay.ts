import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    pays: Pay
  }
  extend type Mutation {
    razorpay(address: AddressInput!): Pay @auth
    capturePay(payment_id: String!, oid: String!): Order @auth
  }

  type Pay {
    id: String,
  entity: String,
  amount: Float,
  currency: String,
  status: String,
  order_id: String,
  invoice_id: String,
  international: Boolean,
  method: String,
  amount_refunded: Float,
  refund_status: String,
  captured: Boolean,
  description: String,
  card_id: String,
  bank: String,
  wallet: String,
  vpa: String,
  email: String,
  contact: String,
  fee: Float,
  tax: Float,
  error_code: String,
  error_description: String,
  created_at: String
  }
`
