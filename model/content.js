const Model = require('./index')
const autoIncrement = require('mongoose-auto-increment')

/* 转义 HTML 实体字符 */
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ObjectId = mongoose.Schema.Types.ObjectId

const ContentSchema = new Schema({
  is_hide: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  content_type: { type: Number, default: 0 },
  comment: { type: String, default: '(空内容)' },
  comment_format: { type: String, defualt: '(空内容)' },
})

ContentSchema.plugin(autoIncrement.plugin, {
  model: 'Counter',
  field: 'commentId',
  startAt: 0,
  incrementBy: 1,
})

const mhook = require('./async-middle-hook')
ContentSchema.pre('save', mhook(async function () {
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

ContentSchema.pre('save', mhook(async function () {
  this.is_hide = false    // 只要创建了，那么它【必须】是 false
  this.content_type = 0   //***** 强制锁为 0，以后再开发其他的格式
  this.date = new Date    // 创建时间设为当前时间
}))

/* 处理文本 */
/* 暂且保留，因为前端是写入 innerText 中的 */
// ContentSchema.pre('save', mhook(async function () {
//   this.comment_format = entities.encode(this.comment)
// }))

const ContentModel = mongoose.model('Content', ContentSchema)
module.exports = ContentModel
