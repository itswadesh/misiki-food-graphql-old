import express, { RequestHandler, NextFunction } from 'express'
import session from 'express-session'
import passport from 'passport'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './typeDefs'
import resolvers from './resolvers'
import schemaDirectives from './directives'
import { SESSION_OPTIONS, APOLLO_OPTIONS, STATIC_PATH } from './config'
import { Request, Response } from './types'
import { ensureSignedIn } from './auth'
import oAuthRoutes from './oauth'

export const createApp = (store?: session.Store) => {
  const app = express()

  const sessionHandler = session({ ...SESSION_OPTIONS, store })

  // Setup Passport
  app.use(sessionHandler)
  app.use(passport.initialize())
  app.use(passport.session())

  oAuthRoutes(app)

  app.use(express.static(STATIC_PATH))
  const server = new ApolloServer({
    ...APOLLO_OPTIONS,
    typeDefs,
    resolvers,
    schemaDirectives,
    context: ({ req, res, connection }) =>
      connection ? connection.context : { req, res },
    subscriptions: {
      onConnect: async (connectionParams, webSocket, { request }) => {
        const req = await new Promise(resolve => {
          sessionHandler(request as Request, {} as Response, () => {
            // Directives are ignored in WS; need to auth explicitly
            // ensureSignedIn(request as Request)

            resolve(request)
          })
        })

        return { req }
      }
    }
  })

  server.applyMiddleware({ app, cors: false })

  return { app, server }
}
