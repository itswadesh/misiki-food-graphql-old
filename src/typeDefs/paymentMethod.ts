import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    paymentMethods(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      active: Boolean
    ): PayMethodRes
    paymentMethod(id: ID!): PaymentMethod @auth
  }
  extend type Mutation {
    savePaymentMethod(
      id: String!
      name: String!
      value: String
      img: String
      color: String
      position: Int
      key: String
      text: String
      featured: Boolean
      active: Boolean
    ): PaymentMethod @admin @demo
    deletePaymentMethod(id: ID!): Boolean @admin @demo
  }

  type PayMethodRes {
    data: [PaymentMethod]
    count: Int
    pageSize: Int
    page: Int
  }

  type PaymentMethod {
    id: String!
    name: String!
    value: String
    img: String
    color: String
    position: Int
    key: String
    text: String
    featured: Boolean
    active: Boolean
  }
`
