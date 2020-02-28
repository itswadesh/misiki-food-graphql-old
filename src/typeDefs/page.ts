import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    sendPage(chatId: ID!, body: String!): Page @auth
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
