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

app
  .use(api.routes())
  .use(api.allowedMethods())

app.use(koa_static(path.join(__dirname, 'static/')))

module.exports = app
