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
    productReviews(
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
    saveReview(id: String, product: ID, variant: ID, user: ID, rating: Int, message: String, active:Boolean): Review @auth
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
