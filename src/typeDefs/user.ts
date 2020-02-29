import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    me: User @auth
    user(id: ID!): User @auth
    users: [User!]! @auth
  }

  extend type Mutation {
    getOtp( phone: String! ):String @guest
    verifyOtp( phone: String!, otp:String! ):User @guest

    signUp(
      name: String
      email: String
      password: String!
    ): User @guest

    updateProfile(
      name: String
      email: String
      password: String!
      role: String
      gender: String
      info:  String
      avatar: String
      provider: String
      active: Boolean
      verified: Boolean
      address: String
      meta: String
      metaTitle: String
      metaDescription: String
      metaKeywords: String
    ): User @guest

    signIn(email: String!, password: String!): User @guest
    signOut: Boolean @auth
  }

  type User {
    id: ID!
    name: String
    phone: String!
    email: String
    role: String
    gender: String,
    info:  String,
    avatar: String,
    provider: String,
    active: Boolean
    verified: Boolean
    address: Address,
    meta: String,
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String
    createdAt: String!
    updatedAt: String!
  }
`
