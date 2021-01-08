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
  getDMY,
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

  const closeRestaurant = async (variables: any) => {
    const { APP_PORT = '6600' } = process.env
    try {
      await Axios({
        url: `http://localhost:${APP_PORT}/graphql`,
        method: 'post',
        data: {
          query: `
          mutation closeRestaurant($city: String, $time: String){
            closeRestaurant(city: $city, time: $time)
          }
          `,
          variables,
        },
      })
    } catch (e) {
      console.log('CRON Error...', e)
    }
  }

  // Close lunch at 2:00PM
  cron.schedule('00 14 * * *', async function () {
    const { day, month, year } = getDMY()
    console.log('---------------------')
    console.log(
      'Close Lunch - Sunabeda+Brahmapur - Start',
      `${day}-${month}-${year}-2:00 PM`
    )
    closeRestaurant({ time: '12 - 2 PM' })
    console.log('Close Lunch - Sunabeda+Brahmapur - Finish')
    console.log('---------------------')
  })

  // Close dinner at 6:00PM
  cron.schedule('00 18 * * *', async function () {
    const { day, month, year } = getDMY()
    console.log('---------------------')
    console.log('Close Dinner - Sunabeda', `${day}-${month}-${year}-6:00 PM`)
    closeRestaurant({ city: 'Sunabeda', time: '8:30 - 9:30 PM' })
    console.log('---------------------')
  })

  // Close dinner for berhampur at 8:00PM
  cron.schedule('00 20 * * *', async function () {
    const { day, month, year } = getDMY()
    console.log('---------------------')
    console.log('Close Dinner - Berhampur', `${day}-${month}-${year}-8:00 PM`)
    closeRestaurant({ city: 'Berhampur', time: '8:30 - 9:30 PM' })
    console.log('---------------------')
  })

  return { app, server }
}
