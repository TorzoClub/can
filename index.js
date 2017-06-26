const http = require('http')
const app = require('./app')
const cfg = require('./config')

const server = http.createServer(app.callback())

server.listen(80)
server.on('error', err => {
  console.error('server error', err.message)
  throw err;
})
server.on('listening', () => {
  console.info(`server started. port: ${cfg.port}`)
})
