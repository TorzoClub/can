const Model = require('./index')

/* 转义 HTML 实体字符 */
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ObjectId = mongoose.Schema.Types.ObjectId

const incrementSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
})
const increment = mongoose.model('Increment', incrementSchema)

const CommentSchema = new Schema({
  is_hide: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  duration: { type: Number, default: 72 },
  content_type: { type: Number, default: 0 },
  comment: { type: String, default: '(空内容)' },
  comment_format: { type: String, defualt: '(空内容)' },

  commentId: { type: Number },
})

const mhook = require('./async-middle-hook')

CommentSchema.pre('save', mhook(async function () {
  /* 检查正文 */
  if (typeof(this.comment) !== 'string') {
    const err = new Error('警告：comment 字段不存在')
    throw err
  } else {
    this.comment = this.comment.trim()
  }

  if (this.comment.replace(/(\s|\n)/g, '').length < 20) {
    const err = new Error('警告：comment 字数过短，不能小于 20 长度')
    throw err
  }
}))

CommentSchema.pre('save', mhook(async function () {
  this.is_hide = false    // 只要创建了，那么它【必须】是 false
  this.content_type = 0   // ***** 强制锁为 0，以后再开发其他的格式
  this.date = new Date    // 创建时间设为当前时间
}))

/* 自增 commentId */
CommentSchema.pre('save', mhook(async function () {
  let incrementResult = await increment.findByIdAndUpdate(
    { _id: 'commentId' },
    { $inc: {seq: 1} }
  )
  if (!incrementResult) {
    incrementResult = new increment({ _id: 'commentId', seq: 0 })
    await incrementResult.save()
    incrementResult = await increment.findByIdAndUpdate(
      { _id: 'commentId' },
      { $inc: {seq: 1} }
    )
  }
  this.commentId = incrementResult.seq
}))

/* 处理文本 */
/* 暂且保留，因为前端是写入 innerText 中的 */
// CommentSchema.pre('save', mhook(async function () {
//   this.comment_format = entities.encode(this.comment)
// }))

// 发送时间超过 72 小时的则隐藏
setInterval(async () => {
  const date_condition = new Date
  date_condition.setHours(date_condition.getHours() - 72)
  await CommentModel.update({
    is_hide: false,
    date: { $lte: date_condition },
  }, {
    is_hide: true
  }, { multi: true })
}, 1000 * 60)

const CommentModel = mongoose.model('Comment', CommentSchema)
module.exports = CommentModel
