Math.guid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16)
  }).toUpperCase()
};

const Model = {
  inherited() {},
  created() {},

  prototype: {
    init() {},
  },

  // 創建一個「子類」
  create() {
    const obj = Object.create(this)

    // 原型鏈
    obj.prototype = obj.fn = Object.create(this.prototype)

    /* 對象創建時執行 created */
    obj.created()

    /* 被繼承時執行 inherited */
    this.inherited()

    return obj
  },

  // 返回一個實例
  init() {
    const instance = Object.create(this.prototype)
    instance.parent = this

    // 實例所繼承的 init 方法為構造函數
    instance.init.apply(instance, arguments)

    return instance
  },

  // 添加靜態屬性
  // extended 的意思是執行完成后的回調事件，參數是當前上下文環境
  extend(obj) {
    const extended = obj.extended
    Object.assign(this, obj)
    if (extended) extended(this)
  },

  // 在原型中添加屬性
  // included 的意思是執行完成后的回調事件，參數是當前上下文環境
  include(obj) {
    const included = obj.included
    Object.assign(this.prototype, obj)
    if (included) included(this)
  },
};

Model.extend({
  created() {
    this.records = {}
    this.attributes = []
  },
  find(id) {
    const record = this.records[id]
    if (!record) throw new Error("unknown record")

    return record.dup()
  },
  saveLocal(name) {
    const result = [];
    for (const i in this.records) result.push(this.records[i])

    localStorage[name] = JSON.stringify(result)
  },
  loadLocal(name) {
    const result = JSON.parse(localStorage[name])
    this.populate(result)
  },
  populate(values) {
    this.records = {}

    for (let i = 0, il = values.length; i < il; ++i) {
      const record = this.init(values[i])
      record.newRecord = false
      this.records[record.id] = record
    }
  },
})

Model.include({
  init(atts) {
    if (atts) this.load(atts)
  },
  load(attributes) {
    Object.assign(this, attributes)
  },
})


Model.include({
  __is_new_record__: false,
  create() {
    if (!this.id) this.id = Math.guid()
    this.__is_new_record__ = true
    this.parent.records[this.id] = this.dup()
  },
  destroy(id) {
    delete this.parent.records[this.id]
  },
  update(values) {
    this.parent.records[this.id] = this.dup()
  },
  save() {
    this.__is_new_record__ ? this.update() : this.create()
  },
  dup() {
    return jQuery.extend(true, {}, this)
  },
  toJSON() {
    return (this.attributes())
  },
  attributes() {
    const result = {}
    for (const attr_key in this.parent.attributes) {
      const key = this.parent.attributes[attr_key]
      result[key] = this[key]
    }
    result.id = this.id
    return result
  },
})
