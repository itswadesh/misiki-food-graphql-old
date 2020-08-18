import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    carts: cartRes @admin
    abandoned: cartRes @admin
    cart: Cart
    # checkCart(pid: ID!): Boolean
    getCartQty(pid: ID!, vid: ID!, options: String): Int!
    # getCartValue: Int!
  }

  extend type Mutation {
    addToCart(pid: ID!, qty: Int!, replace: Boolean): Cart
    clearCart: Boolean
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
    vid: ID
    name: String
    img: String
    slug: String
    price: Float
    status: String
    vendor: Vendor
    tracking: String
    qty: Int
    time: String
    options: String
  }

  type cartRes {
    data: [Cart]
    count: Int
    pageSize: Int
    page: Int
  }
`
