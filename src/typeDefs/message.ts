import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    messages(page: Int, search: String, limit:Int, sort:String): messageRes
    message(id: String!): Message
  }
  extend type Mutation {
    removeMessage(id:ID!): Message @auth
    saveMessage(      id: String      body:String    ): Message @auth
  }
  # extend type Subscription {
  #   messageSent(chatId: ID!): Message @auth
  # }

  type Message {
    id: ID!
    body: String!
    user: User!
    createdAt: String!
    updatedAt: String!
  }
  
  type messageRes {
    data: [Message]
    count: Int
    pageSize: Int
    page: Int
  }
`
