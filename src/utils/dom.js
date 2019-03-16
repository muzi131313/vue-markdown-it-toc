/* istanbul ignore next */

import Vue from 'vue'

import { type } from './tools'

const isServer = Vue.prototype.$isServer
// console.log('isServer: ', isServer)
/* eslint-disable */
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/
const ieVersion = isServer ? 0 : Number(document.documentMode)

/* istanbul ignore next */
const trim = function(string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}
/* istanbul ignore next */
const camelCase = function(name) {
  return name.replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter
  }).replace(MOZ_HACK_REGEXP, 'Moz$1')
}

/* istanbul ignore next */
export const on = (function() {
  if (!isServer && document.addEventListener) {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  }
  else {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/* istanbul ignore next */
export const off = (function() {
  if (!isServer && document.removeEventListener) {
    return function(element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  }
  else {
    return function(element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

/* istanbul ignore next */
export const once = function(el, event, fn) {
  var listener = function() {
    if (fn && fn.apply) {
      fn.apply(this, arguments)
    }
    off(el, event, listener)
  }
  on(el, event, listener)
}

/* istanbul ignore next */
export function hasClass(el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  }
  else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

/* istanbul ignore next */
export function addClass(el, cls) {
  if (!el) return
  var curClass = el.className
  var classes = (cls || '').split(' ')

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList && el.classList.add) {
      el.classList.add(clsName)
    }
    else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
}

/* istanbul ignore next */
export function removeClass(el, cls) {
  if (!el || !cls) return
  var classes = cls.split(' ')
  var curClass = ' ' + el.className + ' '

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    }
    else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
}

/* istanbul ignore next */
export const getStyle = ieVersion < 9 ? function(element, styleName) {
  if (isServer) return
  if (!element || !styleName) return null
  styleName = camelCase(styleName)
  if (styleName === 'float') {
    styleName = 'styleFloat'
  }
  try {
    switch (styleName) {
    case 'opacity':
      try {
        return element.filters.item('alpha').opacity / 100
      }
      catch (e) {
        return 1.0
      }
    default:
      return (element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null)
    }
  }
  catch (e) {
    return element.style[styleName]
  }
} : function(element, styleName) {
  if (isServer) return
  if (!element || !styleName) return null
  styleName = camelCase(styleName)
  if (styleName === 'float') {
    styleName = 'cssFloat'
  }
  try {
    var computed = document.defaultView.getComputedStyle(element, '')
    return element.style[styleName] || computed ? computed[styleName] : null
  }
  catch (e) {
    return element.style[styleName]
  }
}

/* istanbul ignore next */
export function setStyle(element, styleName, value) {
  if (!element || !styleName) return

  if (typeof styleName === 'object') {
    for (var prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop])
      }
    }
  }
  else {
    styleName = camelCase(styleName)
    if (styleName === 'opacity' && ieVersion < 9) {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')'
    }
    else {
      element.style[styleName] = value
    }
  }
}

/**
 * @name getScrollTop
 * @desc {{description}}{{获取滚动高度}}
 * @createTime 2019年03月06日17:34:23
 */
export const getScrollTop = () => {
  return window.pageYOffset
  || document.documentElement.scrollTop
  || document.body.scrollTop
}

/**
 * @name isInScreen
 * @param {Document} dom dom对象
 * @desc {{description}}{{是否在屏幕内}}
 * @createTime 2019年03月07日12:02:52
 */
export const isInScreen = (dom, offset = 0) => {
  if (!dom) {
    return false
  }
  const rect = dom.getBoundingClientRect()
  return rect ? rect.top > offset : false
}

/**
 * @name delegate
 * @param {*} container 当前的容器
 * @param {*} triggerDom 触发容器的dom(某一类dom, 应该为a, .someClass)
 * @param {*} eventType 事件类型
 * @param {*} callback 事件回调
 */
export const delegate = (container, triggerDom, eventType, callback) => {
  if (!container || !triggerDom || !eventType || !callback) {
    return console.warn(`${container}/${triggerDom}/${eventType}/${callback} was empty!`)
  }
  const triggerDomType = type(triggerDom)
  const isDomTypeString = triggerDomType === 'string'
  if (!isDomTypeString) {
    return console.warn(`triggerDomType(${triggerDomType}) should be string selector, like: a, .someClass`)
  }
  const slice = Array.prototype.slice
  const allTriggerDoms = container.querySelectorAll(triggerDom)
  triggerDom = allTriggerDoms
    ? slice.call(allTriggerDoms)
    : []
  on(container, eventType, e => {
    if (e && e.target) {
      const index = ~triggerDom.indexOf(e.target)
      if (index) {
        callback(e)
      }
    }
  })
}
