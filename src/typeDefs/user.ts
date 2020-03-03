import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    me: User @auth
    user(id: ID!): User @auth
    users: [User!]! @auth
  }

  extend type Mutation {
    getOtp(phone: String!): String @guest
    verifyOtp(phone: String!, otp: String!): User @guest

    signUp(
      firstName: String
      lastName: String
      email: String
      password: String!
    ): User @guest

    updateProfile(
      firstName: String
      lastName: String
      email: String
      role: String
      gender: String
      info: InputInfo
      phone: String
      dob: String
      avatar: String
      provider: String
      active: Boolean
      verified: Boolean
      address: AddressInput
      meta: String
      metaTitle: String
      metaDescription: String
      metaKeywords: String
    ): User @auth

    signIn(email: String!, password: String!): User @guest
    signOut: Boolean @auth
  }

  input AddressInput {
    town: String
    city: String
    state: String
    zip: Int
    country: String
    coords: Geo
    address: String
    firstName: String
    lastName: String
    phone: String
  }

  input InputInfo {
    public: Boolean
    restaurant: String
    kitchenPhotos: [String]
  }

  type Info {
    public: Boolean
    restaurant: String
    kitchenPhotos: [String]
  }

  type User {
    id: ID!
    firstName: String
    lastName: String
    phone: String
    email: String
    role: String
    gender: String
    info: Info
    avatar: String
    provider: String
    active: Boolean
    verified: Boolean
    address: Address
    meta: String
    metaTitle: String
    metaDescription: String
    metaKeywords: String
    createdAt: String!
    updatedAt: String!
  }
`
