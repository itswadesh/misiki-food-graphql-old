import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    emailTemplates(folder: String, name: String): String
    emailTemplate(id: String): EmailTemplate
  }

  extend type Mutation {
    # removeEmailTemplate(id: ID!): EmailTemplate @auth
    saveEmailTemplate(
      id: String
      name: String
      title: String
      description: String
      content: String
      active: Boolean
    ): EmailTemplate @auth
  }

  type EmailTemplate {
    id: String
    name: String
    title: String
    description: String
    content: String
    user: User
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }
`
