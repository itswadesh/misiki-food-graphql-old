import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    slots(page: Int, skip: Int, limit: Int, search: String, sort: String): SlotRes
    slot(id: ID!): Slot @auth
  }

  extend type Mutation {
    saveSlot(id: ID!,  name: String,  val: String,  slug: String,  info: String,  active: Boolean): Slot @auth  
  }

  type SlotRes{
    data: [Slot]
    count: Int
    pageSize: Int
    page: Int
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
