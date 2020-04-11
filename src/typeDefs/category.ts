import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    categories(page: Int, search: String, limit: Int, sort: String): categoryRes
    category(id: String, slug: String): Category
  }

  extend type Mutation {
    saveCategory(
      id: String
      name: String!
      slug: String
      img: String
      megamenu: Boolean
      featured: Boolean
      active: Boolean
    ): Category @admin
    deleteCategory(id: ID!): Boolean @admin
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
    user: User
    count: Int
    sizechart: String
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type categoryRes {
    data: [Category]
    count: Int
    pageSize: Int
    page: Int
  }
`
