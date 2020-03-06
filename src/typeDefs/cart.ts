import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    carts: [Cart!] @auth
    abandoned: Cart @auth
    cart: Cart
    # checkCart(pid: ID!): Boolean
    getCartQty(pid: ID!): Int!
    # getCartValue: Int!
  }

  extend type Mutation {
    addToCart(pid: ID!, qty: Int!, replace: Boolean): Cart
    removeFromCart(cartId: ID!): Cart @auth
  }

  type Cart {
    id: ID!
    uid: User
    cart_id: Cart
    qty: Int
    discount: Coupon
    subtotal: Float
    shipping: Shipping
    tax: Tax
    total: Float
    offer_total: Float
    items: [CartItem]
    vendor: User
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type CartItem {
    pid: ID
    name: String
    img: String
    slug: String
    rate: Float
    qty: Int
  }

  type Shipping {
    charge: Int
  }
`
