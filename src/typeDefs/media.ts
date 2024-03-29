import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    medias: [Media!]
    media(id: ID!): Media
  }

  extend type Mutation {
    singleUpload(file: Upload!, folder: String): File 
    fileUpload(files: [Upload!], folder: String): [File] 
    deleteFile(path: String): File 
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
    user: User
    use: String
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }
`
