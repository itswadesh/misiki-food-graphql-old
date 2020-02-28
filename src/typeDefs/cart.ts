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
    items: [CartItem]
    vendor: User
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type CartItem {
    id: Product
    name: String
    img: String
    slug: String
    rate: Float
    qty: Int
  }
`
