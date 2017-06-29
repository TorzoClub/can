const cfg = require('../../config')
const Model = require('../../model')
const pkg = require('../../package')
const CommentModel = Model.Comment

const Router = require('koa-router')

const router = new Router

router.post('/comment', async (ctx, next) => {
  let cont = ctx.request.body
  let apiBack = ctx.apiBack

  if (!ctx.isCorrectCaptcha(ctx.request.body.captcha)) {
    apiBack.message = '验证码不正确'
    apiBack.code = 1
  } else {
    const cont_model = new CommentModel(cont)
    try {
      apiBack.result = await cont_model.save()
    } catch (e) {
      apiBack.message = e.message
      apiBack.code = -1
    }
  }

  await next()
})

module.exports = router
