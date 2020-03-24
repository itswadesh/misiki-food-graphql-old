import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    coupons(page: Int, search: String, limit:Int, sort:String): couponRes @auth
    coupon(id: String!): Coupon @auth
  }

  extend type Mutation {
    applyCoupon(code: String!): Cart @auth
    saveCoupon(
      id: String
      code: String!
      value: Float!
      type: String
      info: String
      msg: String
      text: String
      terms: String
      color: String
      minimumCartValue: Float
      maxAmount: Float
      from: String
      to: String
      active: Boolean
    ): Coupon @auth
    createCoupon(
      code: String!
      value: Float!
      type: String
      info: String
      msg: String
      text: String
      terms: String
      color: String
      minimumCartValue: Float
      maxAmount: Float
      from: String
      to: String
      active: Boolean
    ): Coupon @auth
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
    color: String
    minimumCartValue: Float
    maxAmount: Float
    from: String
    to: String
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type couponRes {
    data: [Coupon]
    count: Int
    pageSize: Int
    page: Int
  }
`
