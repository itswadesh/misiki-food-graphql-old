const ONE_DAY = 1000 * 60 * 60 * 24

export const {
  HTTP_PORT = 3000,
  NODE_ENV = 'development',

  DB_USERNAME = 'admin',
  DB_PASSWORD = 'secret',
  DB_HOST = 'localhost',
  DB_PORT = 27017,
  DB_NAME = 'chat',

  SESS_NAME = 'sid',
  SESS_SECRET = 'ssh!secret!',
  SESS_LIFETIME = ONE_DAY,

  REDIS_HOST = 'localhost',
  REDIS_PORT = 6379,
  REDIS_PASSWORD = 'secret'
} = process.env

export const IN_PROD = NODE_ENV === 'production'

// Password URL encoded to escape special characters
export const DB_URI = `mongodb://${DB_USERNAME}:${encodeURIComponent(
  DB_PASSWORD
)}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`
export const DB_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true }

export const REDIS_OPTIONS = {
  host: REDIS_HOST,
  port: +REDIS_PORT,
  password: REDIS_PASSWORD
  // TODO: retry_strategy
}

export const SESS_OPTIONS = {
  name: SESS_NAME,
  secret: SESS_SECRET,
  resave: true,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    maxAge: +SESS_LIFETIME,
    sameSite: true,
    secure: IN_PROD
  }
}

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
