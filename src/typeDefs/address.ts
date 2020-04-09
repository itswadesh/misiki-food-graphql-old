import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    addresses: [Address!] @auth
    address(id: ID!): Address @auth
    getLocation(lat: Float, lng: Float): Address
  }

  extend type Mutation {
    deleteAddress(id: ID!): Boolean @auth

    addAddress(
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

    updateAddress(
      id: ID!
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
    lat: String
    lng: String
  }
`
