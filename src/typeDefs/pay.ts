import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    razorpay(address: String!): Pay @auth
    capturePay(payment_id: String!, oid: String!): Pay @auth
  }

  type Pay {
    id: ID!
    payment: String!
    createdAt: String!
    updatedAt: String!
  }
`
