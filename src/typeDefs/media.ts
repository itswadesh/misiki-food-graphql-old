import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    medias: [Media!]
    media(id: ID!): Media
  }

  extend type Mutation {
    createMedia(
      originalFilename: String
      src: String
      path: String
      size: String
      type: String
      name: String
      use: String
      active: Boolean
    ): Media @auth
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
