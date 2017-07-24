const cfg = require('../../config')
const Model = require('../../model')
const pkg = require('../../package')

const toHash = require('utility').md5
const randomString = require('../utils/random-string')

const CommentModel = Model.Comment

const Router = require('koa-router')

const router = new Router

// 登錄
router.post('/auth', async (ctx, next) => {
  const {apiBack} = ctx

  const true_pass = cfg.pass
  const {pass_garble} = ctx.session
  const {pass} = ctx.request.body

  const auth_result = toHash(true_pass + pass_garble) === pass
  ctx.session.is_login = auth_result
  apiBack.result = auth_result

  apiBack.message = 'ok'
})

// 登出
router.get('/logout', async (ctx, next) => {
  const {apiBack, session} = ctx
  delete session.is_login
  delete session.pass_garble
  apiBack.result = true
  apiBack.message = 'ok'
})

// 獲取登錄狀態
router.get('/auth', async (ctx, next) => {
  const {apiBack, session} = ctx
  session.pass_garble = randomString(12)

  apiBack.result = {
    is_login: Boolean(session.is_login),
    pass_garble: session.pass_garble,
  }
  apiBack.message = 'ok'
})

// 驗證登錄狀態
router.use('/*', async (ctx, next) => {
  if (ctx.session.is_login) {
    await next()
  } else {
    ctx.status = 401
    ctx.apiBack.message = 'Unauthorized'
  }
})

router.delete('/comment', async (ctx, next) => {
  ctx.body = 'hello, DELETE'
})

module.exports = router
