import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    sendMedia(chatId: ID!, body: String!): Media @auth
  }

  type Media {
    id: ID!
    originalFilename: String
    src: String
    path: String
    size: String
    type: String
    name: String
    uid: User
    use: String
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }
`
