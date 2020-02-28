import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    addToCart(cartId: ID!, qty: Int!): Cart
    removeFromCart(cartId: ID!): Cart @auth
  }

  type Cart {
    id: ID!
    uid: User
    cart_id: Cart
    qty: Int
    discount: Coupon
    subtotal: Float
    tax: String
    total: Float
    offer_total: Float
    items: [Product]
    vendor: User
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }
`
