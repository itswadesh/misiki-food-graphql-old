import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    addresses: [Address!]
    address(id: ID!): Address
    getLocation(lat: String, lng: String): Address
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
      zip: String
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
    zip: String
    phone: String
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  input Geo {
    lat: String
    lng: String
  }

  type Coords {
    lat: String
    lng: String
  }
`
