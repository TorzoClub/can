const send = require('koa-send')

const makeCaptcha = require('../utils/makecaptcha')

const Router = require('koa-router')

const router = new Router

const bodyParser = require('koa-bodyparser')
router.use(bodyParser())

const waitting = t => new Promise(r => setTimeout(r, t))

// 刷新验证码并获取验证码图片
router.get('/captcha', async ctx => {
  const {img, str} = makeCaptcha()
  ctx.session.captcha_code = str

  ctx.set('Content-Type', 'image/bmp')
  await waitting(3000)
  ctx.body = img._data
})

router.use('/*', async (ctx, next) => {
  ctx.isCorrectCaptcha = input_captcha => input_captcha === ctx.session.captcha_code
  await next()
})

// 验证提交用户输入的验证码
// router.post('/captcha', (ctx, next) => {
//
// })

module.exports = router
