const mongoose = require('mongoose')

const EventEmitter = require('events')
const cfg = require('../config')

const model = new EventEmitter
module.exports = model

console.warn('數據庫：', cfg.db)
model.connectionStatus = new Promise(resolve => {
	model.db = mongoose.connect(cfg.db, {
		server: { poolSize: 20 }
	}, err => {
		if (err) {
			console.warn(err, '數據庫連接失敗')
			reject(err)
			process.exit(-1)
		} else {
			console.warn('數據庫連接成功')
			resolve()
		}
	})
})

Object.assign(model, {
	Content: require('./content') && mongoose.model('Content'),
	mongoose,
})
