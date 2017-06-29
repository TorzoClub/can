const path = require('path')

const Koa = require('koa')
const compress = require('koa-compress')
const koa_static = require('koa-static')

const api = require('./api')

const app = new Koa

const GZIPMIME = /text|application|json|javascript/i
app.use(compress({
  filter: GZIPMIME.test.bind(GZIPMIME),
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}))

const session = require('koa-session')
const redisStore = require('koa-redis')
app.keys = ['secret', 'key'];
app.use(session({
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
  store: redisStore({
  }),
}, app))

app
  .use(api.routes())
  .use(api.allowedMethods())

app.use(koa_static(path.join(__dirname, 'static/')))

module.exports = app
