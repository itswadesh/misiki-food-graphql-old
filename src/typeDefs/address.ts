import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    addresses: [Address!]
    address(id: ID!): Address
  }

  extend type Mutation {
    createAddress(
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
    ): Address @auth
  }

  type Address {
    id: ID!
    email: String
    firstName: String
    lastName: String
    address: String
    town: String
    city: String
    country: String
    state: String
    coords: Coords
    zip: Int
    phone: String
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  input Geo {
    lat: Float
    lng: Float
  }

  type Coords {
    lat: Float
    lng: Float
  }
`
