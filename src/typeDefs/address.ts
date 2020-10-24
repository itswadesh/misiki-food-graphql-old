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
      district: String
      country: String
      state: String
      coords: Geo
      zip: Int
      phone: String
    ): Address @auth
    saveAddress(
      id: String
      email: String
      firstName: String
      lastName: String
      address: String
      town: String
      district: String
      city: String
      country: String
      state: String
      coords: Geo
      zip: Int
      phone: String
      active: Boolean
    ): Address @auth @demo
    updateAddress(
      id: ID!
      email: String
      firstName: String
      lastName: String
      address: String
      town: String
      city: String
      district: String
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
    coords: Coords
    town: String
    city: String
    district: String
    state: String
    zip: Int
    country: String
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
