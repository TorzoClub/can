const api = (() => {
  const _ajax = (type, name, data = {}) => new Promise((resolve, reject) => {
    $.ajax({
      type,
      url: `/api/${name}`,
      dataType: 'json',
      data,
      success(data, status, xhr) {
        if (data.code) {
          reject(data.message)
        } else {
          resolve(data.result)
        }
      },
      error(xhr, errorType, error) {
        reject(error)
      },
    })
  })

  return {
    get: name => _ajax('GET', name),
    post: (name, data = {}) => _ajax('POST', name, data),
    delete: (name, data = {}) => _ajax('DELETE', name, data),
  }
})()

const main = new Vue({
  el: '#main',
  data: {
    denied_count: 0,
    is_login: false,
    is_loading: true,
    pass: '',
    pass_garble: '',
    login_message: '　',
    comments: [],
  },
  methods: {
    authStatus() {
      api.get('auth')
      .then(result => {
        this.is_loading = false
        this.is_login = result.is_login
        this.pass_garble = result.pass_garble
      })
      .catch(err => console.error('錯誤：', err))
    },
    logout() {
      const fail = err => {

      }
      api.get('logout')
      .then(result => {
        if (result) {
          this.is_loading = true
        } else {
          fail('登出操作失敗')
        }
      })
      .catch(fail)
    },
    loginSubmit(pass) {
      const fail = err => {
        this.login_message = err
      }

      pass = md5(pass + this.pass_garble)
      api.post('auth', { pass })
      .then(result => {
        if (result) {
          this.is_login = true
        } else {
          this.pass = ''
          ++this.denied_count
          if (this.denied_count >= 5) {
            fail('你故意的？我不太信這是 bug')
          } else {
            fail('登錄失敗，也許是密碼錯誤')
          }
        }
      })
      .catch(fail)
    },
    submit() {
      if (this.pass.length) {
        this.loginSubmit(this.pass)
      } else {
        this.login_message = '不接受空字符密碼'
      }
    }
  },
  watch: {
    pass(val) {
      if (val.length) {
        this.login_message = '　'
      }
    },
    is_loading(val) {
      if (val) {
        this.is_login = false
        this.authStatus()
      }
    }
  },
  mounted() {
    this.authStatus()
  },
})
