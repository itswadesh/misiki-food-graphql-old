import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    sendWishlist(chatId: ID!, body: String!): Wishlist @auth
  }

  type Wishlist {
    id: ID!
    product: Product!
    variant: Variant
    uid: User!
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }
`
