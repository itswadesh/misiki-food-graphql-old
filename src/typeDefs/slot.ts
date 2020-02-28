import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    sendSlot(chatId: ID!, body: String!): Slot @auth
  }

  type Slot {
    id: ID!
    name: String!
    val: String
    slug: String!
    info: String
    uid: User!
    active: Boolean!
    createdAt: String!
    updatedAt: String!
  }
`
