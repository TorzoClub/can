const send = require('koa-send')

const makeCaptcha = require('../utils/makecaptcha')

const Router = require('koa-router')

const router = new Router

const bodyParser = require('koa-bodyparser')
router.use(bodyParser())

const waitting = t => new Promise(r => setTimeout(r, t))

const randomString = (() => {
  const p = "ABCDEFGHIJKLMNOPQRSTUVWXYZ3456789"
  return (len = 5) => {
    let str = ''
    for(let i = 0; i < len; i++) {
      str += p.charAt(Math.random() * p.length | 0)
    }
    return str
  }
})()

const refresh = async ctx => ctx.session.captcha_code = randomString(5)

// 刷新验证码
router.get('/refresh', async ctx => {
  ctx.apiBack.result = refresh(ctx)
  ctx.apiBack.message = 'ok'
  await next()
})

// 获取验证码图片
router.get('/captcha', async ctx => {
  if (!('captcha_code' in ctx.session)) {
    refresh(ctx)
  }
  const img = makeCaptcha(ctx.session.captcha_code)

  ctx.set('Content-Type', 'image/bmp')
  await waitting(3000)
  ctx.body = img._data
})

router.use('/*', async (ctx, next) => {
  ctx.isCorrectCaptcha = input_captcha => input_captcha === ctx.session.captcha_code
  await next()
})

module.exports = router
