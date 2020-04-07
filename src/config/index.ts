export * from './app'

export * from './auth'

export * from './db'

export * from './cache'

export * from './mail'

export * from './session'

export * from './payment'

import { IN_PROD } from './app'
export const APOLLO_OPTIONS = {
  playground: IN_PROD
    ? false
    : {
      settings: {
        'request.credentials': 'include'
      }
    }
}

export const SHOP_NAME = 'Misiki'

export const PAY_MESSAGE = 'Payment for food @ ' + SHOP_NAME

export const ORDER_PREFIX = 'M'

export const STATIC_PATH = './../misiki-images'

export const UPLOAD_DIR = '/images/'

export const startT = { h: 18, m: 0 }
export const start = '06:00 pm'
export const endT = { h: 22, m: 0 }
export const end = '10:00 pm'

export const closed = {
  from: { hour: 13, minute: 44 }, to: { hour: 13, minute: 55 },
  message: 'Sorry we are closed from 1:30 PM to 1:40 PM'
}