import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    sendCoupon(chatId: ID!, body: String!): Coupon @auth
  }

  type Coupon {
    id: ID!
    code: String
    value: Float
    type: String
    info: String
    msg: String
    text: String
    terms: String
    minimumCartValue: Float
    maxAmount: Float
    from: String!
    to: String!
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }
`
