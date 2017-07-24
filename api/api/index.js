const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const router = new Router
router.use(bodyParser())
router.use(async (ctx, next) => {
  ctx.apiBack = {
    code: 0,
    message: '(缺省)',
    result: null,
  }

    await next()

  if (!ctx.body) {
    ctx.type = 'application/json'
    ctx.body = JSON.stringify(ctx.apiBack)
  }
})

const routers = [
  './comment',
  './captcha',
  './comment-post',
  './comment-admin',
]
for (let module_path of routers) {
  const mrouter = require(module_path)
  router.use('', mrouter.routes(), mrouter.allowedMethods())
}

// router.use(async ctx => {
//   ctx.type = 'application/json'
//   ctx.body = JSON.stringify(ctx.apiBack)
// })

module.exports = router
