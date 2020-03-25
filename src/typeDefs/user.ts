import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    me: User @auth
    users(page: Int, search: String, limit:Int, sort:String): userRes @auth
    user(id: String!): User @auth
  }

  extend type Mutation {
    getOtp(phone: String!): String
    verifyOtp(phone: String!, otp: String!): User
    changePassword(
      oldPassword: String!
      password: String!
      passwordConfirmation: String!
    ): Boolean
    saveUser(
      id: String!
      firstName: String
      lastName: String
      avatar: String
      banner: String
      gender: String
      city: String
      state: String
      phone: String
      zip: Int
      type: String
      active: Boolean
    ): User @auth
    register(
      firstName: String
      lastName: String
      email: String
      password: String!
      passwordConfirmation: String!
      referrer: String
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

    login(email: String!, password: String!): User @guest
    signOut: Boolean @auth
  }

  input AddressInput {
    id: ID
    email: String
    firstName: String
    lastName: String
    address: String
    town: String
    city: String
    country: String
    state: String
    coords: Geo
    zip: Int
    phone: String
    active: Boolean
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
  
  type userRes {
    data: [User]
    count: Int
    pageSize: Int
    page: Int
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
    rating: Int
    city: String
    meta: String
    metaTitle: String
    metaDescription: String
    metaKeywords: String
    createdAt: String!
    updatedAt: String!
  }
`
