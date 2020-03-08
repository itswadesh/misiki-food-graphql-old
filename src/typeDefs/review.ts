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
    ): SearchReviews
    review(id: ID!): Review
  }

  extend type Mutation {
    createReview(chatId: ID!, body: String!): Review @auth
  }

  type SearchReviews{
    data: [Review]
    count: Int
    pageSize: Int
    page: Int
  }

  type Review {
    id: ID!
    pid: Product!
    vid: Variant
    uid: User!
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
