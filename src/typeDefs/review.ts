import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    sendReview(chatId: ID!, body: String!): Review @auth
  }

  type Review {
    id: ID!
    pid: Product!
    uid: User!
    vid: Variant
    message: String!
    votes: Vote!
    rating: Float!
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Vote {
    count: Float!
    voters: [User!]!
  }
`
