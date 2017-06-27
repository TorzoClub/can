(function () {
  const bPrototype = {
		BrowserCore: ['ms', 'moz', 'Moz', 'webkit'],
		dom: document.createElement('div'),
		prop: 'Transition',
		init() {
			const result = this.BrowserCore.some(prefix => {
				if (`${prefix}${this.prop}` in this.dom.style)
					return this.core = prefix.toLowerCase()
			})

			if (!result) {
				console.warn('unsupport browser rendering core')
				this.core = 'unknown'
			}

			return this.core
		},
	}
	window.vec_browser = Object.create(bPrototype)
	window.vec_browser.init()
})();

function fillString(str, fill_char = '0', fill_length = str.length) {
  if (typeof(str) !== 'string') {
    str = String(str)
  }

  const fill_str = str.split('')
  if (fill_str.length < fill_length) {
    for (let c = fill_str.length; c < fill_length; ++c) {
      fill_str.unshift(fill_char)
    }
  }

  return fill_str.join('')
}

const toCommentDateString = d => {
  const f = v => fillString(v, '0', 2)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ` +
    `${f(d.getHours())}:${f(d.getMinutes())}:${f(d.getSeconds())}`
}
function isAppleMobileDevice() {
  return /(iPod|iPhone|iPad)/g.test(navigator.userAgent)
}
if (isAppleMobileDevice()) {
  $('#main').addClass('apple-mobile-device')
}

function fillTextArea(container) {
  const fillContainer = container.querySelector('textarea.fill')
  const textareaContainer = container.querySelector('textarea.comment')
  $(container).click(() => textareaContainer.focus())

  textareaContainer.onchange = e => {
    console.warn('onchange')
  }
  const input_handle = e => {
    // let {value} = textareaContainer
    fillContainer.value = textareaContainer.value
    textareaContainer.style.height = `${fillContainer.scrollHeight}px`
  }
  textareaContainer.addEventListener('input', input_handle)
  input_handle()
}

fillTextArea(document.querySelector('.textarea'))

$('.send').click(e => {
  const error_handle = err => {
    alert(err.message)
  }
  $.ajax({
    type: 'POST',
    url: '/api/comment',
    data: {
      comment: $('#input [name="comment"]').val(),
    },
    dataType: 'json',
    success(obj) {
      if (obj.code) {
        error_handle(obj)
      } else {
        console.warn(obj)
      }
    },
    error: error_handle,
  })

  return false
})

class List {
  fetch(callback) {
    const url = `/api/comment/${this.current_page}?date=${this.server_date.toISOString()}`
    const error_handle = err => {
      this.emit('fetch-fail', err)
    }
    $.getJSON(url, obj => {
      if (obj.code) {
        error_handle(obj)
      } else {
        const {result} = obj
        result.forEach(comment => {
          this.emit('fetch-stream', comment)
        })
        ++this.current_page
        this.emit('fetch-comment', result)
      }
    }, error_handle)
  }
  constructor() {
    this.current_page = 1

    const error_handle = err => {
      this.emit('init-fail', err)
    }

    $.getJSON('/api/status', obj => {
      if (obj.code) {
        error_handle(obj)
      } else {
        const result = obj.result
        this.count = result.count
        this.limit = result.limit
        this.total_page = result.total_page
        this.server_date_raw = result.server_date
        this.server_date = new Date(result.server_date)

        this.emit('init', result)
      }
    }, error_handle)
  }
}
List.prototype.__proto__ = EventModel

function createCommentElement(comment) {
  const date = new Date(comment.date)
  const $summary = $('<div class="summary">').append(
    $(`<span class="serial" serial="${comment.commentId + 1}">`),
    $('<time>').text(toCommentDateString(date))
  )

  const articleContainer = document.createElement('article')
  articleContainer.innerText = comment.comment

  const $commentItemContainer = $(`<li class="comment-item comment-show">`).append(
    $summary,
    articleContainer
  )
  Han(articleContainer).render()

  return $commentItemContainer[0]
}

const list = new List

list.on('fetch-comment', comments => {
  comments.forEach((comment, cursor) => {
    setTimeout(() => {
      const commentItemContainer = createCommentElement(comment)
      const $commentContainer = $('#comment')
      $commentContainer.append(commentItemContainer)
    }, cursor * 182)
  })
})
list.once('init', e => {
  list.fetch()
})
list.on('init-fail', err => {
})
list.on('fetch-fail', err => {
  alert(err.message)
})


let scrollFetchLock = false
const scroll_handle = e => {
  if (scrollFetchLock) {
    return
  } else {
    let scrollElement
    if (vec_browser.core === 'ms') {
      scrollElement = $('html')[0]
    } else {
      scrollElement = document.body
    }

    const {scrollTop, offsetHeight, scrollHeight} = scrollElement
    if ((scrollTop + offsetHeight) > scrollHeight - 200) {
      scrollFetchLock = true
      list.once('fetch-comment', () => {
        scrollFetchLock = false
        console.warn('!')
      })
      list.fetch()
    }
  }
}
$(window).on('scroll', scroll_handle)
if (isAppleMobileDevice()) {
  $(window).on('touchmove', 'touchend',() => {
    $(window).off('scroll', scroll_handle)
    scroll_handle()
  })
}
