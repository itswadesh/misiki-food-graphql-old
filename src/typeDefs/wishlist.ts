import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    wishlists: [Wishlist!]
    wishlist(id: ID!): Wishlist
  }

  extend type Mutation {
    createWishlist(chatId: ID!, body: String!): Wishlist @auth
  }

  type Wishlist {
    id: ID!
    product: Product!
    variant: Variant
    user: User!
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }
`
