import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    reviews(
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): ReviewRes
    reviewSummary( product:ID! ): ReviewSummary
    productReviews(
      product:ID!
      page: Int
      skip: Int
      limit: Int
      search: String
      sort: String
      q: String
    ): ReviewRes
    review(id: ID!): Review
  }

  extend type Mutation {
    removeReview(id:ID!): Review @auth
    saveReview(id: String, product: ID, variant: ID, user: ID, rating: Int, message: String, active:Boolean): Review @auth
  }

  type ReviewSummary{
    avg: Float
    count: Float
    total: Float
    reviews: [String]
  }

  type ReviewRes{
    data: [Review]
    count: Int
    pageSize: Int
    page: Int
    total:Float
    avg:Float
  }

  type Review {
    id: ID!
    product: Product!
    variant: Variant
    user: User!
    vendor: User
    message: String
    votes: Vote
    rating: Float
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Vote {
    count: Float!
    voters: [User!]!
  }
`
