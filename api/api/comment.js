const cfg = require('../../config')
const Model = require('../../model')
const pkg = require('../../package')
const ContentModel = Model.Content

const Router = require('koa-router')

const router = new Router

router.get('/comment/:page', async (ctx, next) => {
  const back = ctx.apiBack
  const page = ctx.params.page
  const start = (page - 1) * cfg.limit

  try {
    let date;
    if ('date' in ctx.request.query) {
      const dateQuery = ctx.request.query.date
      date = new Date(dateQuery)
    } else {
      date = new Date
    }

    const list = await ContentModel
      .find({ is_hide: false, date: { $lte: date }})
      .sort({date: -1})
      .skip(start)
      .limit(cfg.limit)

    back.result = list
    back.code = 0
    back.message = 'ok'
  } catch (e) {
    back.code = -3
    back.message = e.message
  }

  await next()
})

router.get('/status', async (ctx, next) => {
  const back = ctx.apiBack

  try {
    const count = await ContentModel.count()

    back.result = {
      count,
      limit: cfg.limit,
      total_page: Math.ceil(count / cfg.limit),
      version: pkg.version,
      server_date: new Date,
    }
    back.message = 'ok'
  } catch (e) {
    back.code = -2
    back.message = e.message
  }

  await next()
})

module.exports = router
