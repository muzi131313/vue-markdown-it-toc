<template>
  <div class="mark-it-toc markdown-body" v-html="markHtml">
  </div>
</template>
<script>
import 'github-markdown-css/github-markdown.css'
import MarkdownIt from 'markdown-it'
// 属性添加
import markdownItAttrs from 'markdown-it-attrs'
// 代码实例演示
import markdownItPlayground from 'markdown-it-playground'
// 定位跳转
import markdownAnchor from 'markdown-it-anchor'
// 侧边栏基础样式生成
// https://www.npmjs.com/package/markdown-it-toc-done-right
import markdownTableOfContent from 'markdown-it-table-of-contents'
import markdownItCheckbox from 'markdown-it-checkbox'
// 汉语转拼音
import pinyin from 'pinyin'

import {
  on,
  off,
  addClass,
  removeClass,
  isInScreen,
  delegate
} from './utils/dom'

import markdownItHighLight from './hightLight'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  // html: false,
  xhtmlOut: true,
  typographer: true,
  langPrefix: 'blog-'
})

// makrdown链接正则
// 链接: https://www.zhangxinxu.com/wordpress/2010/04/javascript%E5%AE%9E%E7%8E%B0http%E5%9C%B0%E5%9D%80%E8%87%AA%E5%8A%A8%E6%A3%80%E6%B5%8B%E5%B9%B6%E6%B7%BB%E5%8A%A0url%E9%93%BE%E6%8E%A5/
// const LINK_REG = /\[([\w]+)\]\(((http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+))\)/g
// https://www.ancii.com/at6zg8dbq/
const LINK_REG = /\[([\s\S]*?)\]\([\s\S]*?\)/
// 复杂正则
// eslint-disable-next-line
const SPECIAL_REG = /[:.、+,/\[\]\(\)`\\?]/g

// 替换掉数字
const NUM_REG = /^\d/

// 替换链接(多个)
const replaceLink = link => {
  if (link) {
    link = link.trim()
  }
  if (LINK_REG.test(link)) {
    link = link.replace(LINK_REG, RegExp.$1)
    link = replaceLink(link)
  }
  return link
}

// 转换拼音
const transChineseToPinYin = chinese => {
  if (!chinese) return ''

  const linkChinese = decodeURIComponent(chinese)
  const pinYin = pinyin(linkChinese, {
    style: pinyin.STYLE_NORMAL
  })
  const pinYinString = pinYin.join('')
  return pinYinString
}

// 处理链接
const handleLink = link => {
  if (!link) {
    return link
  }

  link = link.trim()

  link = transChineseToPinYin(link)

  // 处理markdown链接
  if (LINK_REG.test(link)) {
    link = replaceLink(link)
  }

  // 特殊字符
  if (SPECIAL_REG.test(link)) {
    link = link.replace(SPECIAL_REG, '-')
  }

  // 数字
  if (NUM_REG.test(link)) {
    link = link.replace(NUM_REG, '-')
  }

  return link
}

md.use(markdownItAttrs)
md.use(markdownItPlayground)
md.use(markdownItHighLight)

md.use(markdownItCheckbox)

// makrdown中链接
md.use(markdownAnchor, {
  // 处理链接
  callback(val) {
    const attrs = val.attrs
    let value = handleLink(attrs[0][1])

    attrs[0][1] = value
    return val
  }
})

// 侧边栏链接
md.use(markdownTableOfContent, {
  includeLevel: [1, 2, 3],
  format: function(header) {
    if (header) {
      header = decodeURIComponent(header)
      header = replaceLink(header)
    }
    return header
  },
  transformLink: function(link) {
    if (link) {
      // 处理汉语
      link = link.substr(1)

      link = handleLink(link)
      // console.log('link: ', link)
      return `#${link}`
    }
    return link
  }
})

// toc容器的类
const tocClass = '.table-of-contents'
// toc item激活的class
const activeClass = 'active'
// markdown content scroll top offset
const TOP_OFFSET = 21

export default {
  name: 'MarkdownItToc',
  props: {
    // markdown-it渲染之前的内容
    content: {
      type: String,
      default: ''
    },
    // markdown离顶部的距离
    offset: {
      type: Number,
      default: TOP_OFFSET
    },
    // markdown toc包含的级别
    level: {
      type: Number,
      default: 3
    }
  },
  computed: {
    // markdown-it渲染之后的内容
    markHtml() {
      const content = this.content
      return content ? md.render(content) : ''
    }
  },
  data() {
    return {
      // cover toc dom to array
      tocs: [],
      // toc dom
      tocDoms: null,
      // 第一次初始化
      firstInit: true,
      // toc容器dom
      tocContainer: null,
      // 侧边栏容器高度
      tocHeight: 0
    }
  },
  mounted() {
    // addEvent
    on(document, 'scroll', this.scroll)
    // init toc
    this.initToc()
  },
  methods: {
    initToc() {
      const hash = window.location.hash
      const tocWrap = document.querySelector(tocClass)
      if (!tocWrap) {
        return console.warn('no toc wrap document')
      }
      tocWrap.style.paddingTop = `${this.offset}px`

      const tocDoms = tocWrap ? tocWrap.querySelectorAll('a') || [] : []
      this.tocDoms = tocDoms
      // 侧边栏dom数组
      this.tocs = Array.prototype.slice
        .call(tocDoms)
        .map((toc, index) => {
          const active = hash
            ? toc.getAttribute('href') === hash
            : index === 0
          return {
            toc,
            index,
            active
          }
        })
      // 侧边栏高度
      const container = document.querySelector('.table-of-contents')
      const height = container.offsetHeight - 30 - 40 * 2
      this.tocHeight = height
      this.tocContainer = container
      // 初始化标记
      this.firstInit = true
      setTimeout(() => {
        this.firstInit = false
      }, 100)
      // 主动控制滚动行为
      const index = this.tocs.findIndex(toc => toc.active)
      const tocDom = tocDoms[index]
      if (tocDom) {
        this.scrollByTocDom(tocDom)
      }
      // dom sync
      this.syncActiveDom()
      // delegate click event to `a` document
      delegate(tocWrap, 'a', 'click', e => {
        e.preventDefault()
        const tocDom = e.target
        // 1.scroll the page content
        this.scrollByTocDom(tocDom)
        // 2.solve the hash path
        this.replacePath(tocDom)
      })
    },
    // 同步激活的active class
    syncActiveDom() {
      const tocDoms = this.tocDoms
      this.tocs.forEach((toc, index) => {
        const tocDom = tocDoms[index]
        if (toc.active) {
          addClass(tocDom, activeClass)
        }
        else {
          removeClass(tocDom, activeClass)
        }
      })
    },
    // 同步菜单栏容器位置
    // https://www.zhangxinxu.com/wordpress/2018/02/container-scroll-position-hold/
    syncMenuContainer() {
      const tocHeight = this.tocHeight
      const activeDom = this.tocContainer.querySelector(`.${activeClass}`)
      if (!activeDom) {
        return
      }
      const top = activeDom.offsetTop || 0
      const offset = tocHeight - top
      if (offset < 100) {
        this.tocContainer.scrollTop = 100 - offset
      }
    },
    // 滚动事件
    scroll() {
      if (this.firstInit) {
        return console.warn('this was the frist init!')
      }
      const tocDoms = this.tocDoms
      let isFind = false
      this.tocs.forEach((toc, index) => {
        const tocDom = tocDoms[index]
        const dom = this.getDomContentByTocDom(tocDom)
        const isIn = isInScreen(dom)
        if (!isFind
          && isIn) {
          this.tocs[index].active = true
          isFind = true
        }
        else {
          this.tocs[index].active = false
        }
      })
      this.syncActiveDom()
      this.syncMenuContainer()
    },
    // 根据toc获取toc关联的dom
    getDomContentByTocDom(tocDom) {
      const id = tocDom.getAttribute('href')
      return document.querySelector(id)
    },
    // 更新当前path
    replacePath(tocDom) {
      const href = tocDom.getAttribute('href')
      const pathname = window.location.pathname
      this.$router.replace(`${pathname}${href}`)
    },
    // 根据toc dom进行页面的滚动操作
    scrollByTocDom(tocDom) {
      const contentDom = this.getDomContentByTocDom(tocDom)
      if (!contentDom) {
        return
      }
      const top = contentDom.offsetTop
      window.scrollTo(0, top - this.offset)
    }
  },
  destoryed() {
    off(document, 'scroll', this.scroll)
  }
}
</script>

<style lang="scss">
$sliver: #ebedef;
$black: #333;
$active-color: rgb(25, 149, 249);
$menu-width: 200px;

.mark {
  padding-right: $menu-width + 20;
  padding-bottom: 30px;
}
.table-of-contents {
  position: fixed;
  right: 0;
  height: 100%;
  top: 0;
  // Firefox
  // http://caibaojian.com/hide-scrollbar.html
  overflow-y: -moz-scrollbars-none;
  // IE10+
  -ms-overflow-style: none;
  overflow-y: auto;
  max-width: $menu-width;
  @media (min-width: 768px) {
    right: calc((100% - 750px)/2);
  }
  @media (min-width: 992px) {
    right: calc((100% - 970px)/2);
  }
  @media (min-width: 1200px) {
    right: calc((100% - 1140px)/2);
  }
  @media (max-width: 768px) {
    display: none;
  }
  // Chrome和Safari
  &::-webkit-scrollbar {
    width: 0 !important;
  }
  & > ul {
    list-style-type: none;
    margin: 0;
    height: 100%;
    position: relative;
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 4px;
      bottom: 0;
      width: 2px;
      background-color: $sliver;
      opacity: .5;
    }
    & > li {
      & > a {
        font-weight: 500;
        font-size: 18px;
        &:before {
          content: '';
          position: absolute;
          height: 8px;
          width: 8px;
          border-radius: 4px;
          background-color: $black;
          top: 10px;
          left: -16px;
        }
      }
    }
  }
  ul {
    padding-left: 17px;
    li {
      cursor: pointer;
      a {
        text-decoration: none;
        color: $black;
        display: inline-block;
        position: relative;
        width: 100%;
        padding: 5px 0;
        text-indent: 5px;
        border-radius: 2px;
        &.active {
          background-color: $sliver;
          color: $active-color;
        }
        &:hover {
          background-color: $sliver;
        }
      }
    }
  }
}
</style>
