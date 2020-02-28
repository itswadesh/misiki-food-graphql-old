import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    pages: [Page!]
    page(id: ID!): Page
  }

  extend type Mutation {
    createPage(chatId: ID!, body: String!): Page @auth
  }

  type Page {
    id: ID!
    menuTitle: String
    name: String
    title: String
    slug: String
    description: String
    content: String
    uid: User
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }
`
