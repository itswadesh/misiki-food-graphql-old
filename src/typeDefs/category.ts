import { gql } from 'apollo-server-express'

export default gql`
  extend type Mutation {
    sendCategory(chatId: ID!, body: String!): Category @auth
  }

  type Category {
    id: ID!
    index: Int
    name: String
    slug: String
    pid: [Product!]
    path: String
    slugPath: String
    namePath: String
    pathA: [String]
    level: Int
    position: Int
    megamenu: Boolean
    meta: String
    metaTitle: String
    metaDescription: String
    metaKeywords: String
    img: String
    featured: Boolean
    shopbycategory: Boolean
    children: [Category]
    uid: User
    count: Int
    sizechart: String
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }
`
