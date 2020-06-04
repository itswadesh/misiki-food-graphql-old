import express, { RequestHandler, NextFunction } from 'express'
import session from 'express-session'
import passport from 'passport'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './typeDefs'
import resolvers from './resolvers'
import schemaDirectives from './directives'
import {
  SESSION_OPTIONS,
  APOLLO_OPTIONS,
  STATIC_PATH,
  APP_ORIGIN,
} from './config'
import { Request, Response } from './types'
import { ensureSignedIn } from './auth'
import oAuthRoutes from './oauth'
import exportRoutes from './export'
// const Sentry = require('@sentry/node');
import cron from 'node-cron'
import Axios from 'axios'
import { sleep, sysdate } from './utils'

export const createApp = (store?: session.Store) => {
  const app = express()
  // Sentry.init({ dsn: 'https://3ba47ba8e5fa459bb501bc8faf4b33b6@sentry.io/5182472' });

  // The request handler must be the first middleware on the app
  // app.use(Sentry.Handlers.requestHandler());

  const sessionHandler = session({ ...SESSION_OPTIONS, store })

  // Setup Passport
  app.use(sessionHandler)
  app.use(passport.initialize())
  app.use(passport.session())

  oAuthRoutes(app)
  exportRoutes(app)

  app.use(express.static(STATIC_PATH))

  // The error handler must be before any other error middleware and after all controllers
  // app.use(Sentry.Handlers.errorHandler());

  const server = new ApolloServer({
    ...APOLLO_OPTIONS,
    typeDefs,
    resolvers,
    schemaDirectives,
    context: ({ req, res, connection }) =>
      connection ? connection.context : { req, res },
    subscriptions: {
      onConnect: async (connectionParams, webSocket, { request }) => {
        const req = await new Promise((resolve) => {
          sessionHandler(request as Request, {} as Response, () => {
            // Directives are ignored in WS; need to auth explicitly
            // ensureSignedIn(request as Request)

            resolve(request)
          })
        })

        return { req }
      },
    },
  })

  server.applyMiddleware({ app, cors: false })

  // To backup a database
  cron.schedule('00 18 * * *', async function () {
    var now = Date.now(),
      oneDay = 1000 * 60 * 60 * 24,
      today = new Date(now - (now % oneDay)),
      tomorrow = new Date(today.valueOf() + oneDay)
    const dateTimeFormat = new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
    const [
      { value: month },
      ,
      { value: day },
      ,
      { value: year },
    ] = dateTimeFormat.formatToParts(now)

    console.log('---------------------')
    console.log('Running Cron Job - Misiki', `${day}-${month}-${year}`)
    try {
      await Axios({
        url: `http://localhost:6600/graphql`,
        method: 'post',
        data: {
          query: `
          mutation closeRestaurant{
            closeRestaurant
          }
          `,
        },
      })
    } catch (e) {
      console.log('CRON Error...', e)
    }
    console.log('Cron Job Finished - Misiki')
    console.log('---------------------')
  })

  return { app, server }
}
