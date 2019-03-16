<template>
  <div class="mark-it-toc markdown-body" v-html="markHtml">
  </div>
</template>
<script>
import 'github-markdown-css/github-markdown.css'
import MarkdownIt from 'markdown-it'
import markdownItAttrs from 'markdown-it-attrs'
import markdownItPlayground from 'markdown-it-playground'
import markdownAnchor from 'markdown-it-anchor'
import markdownTableOfContent from 'markdown-it-table-of-contents'

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

md.use(markdownItAttrs)
md.use(markdownItPlayground)
md.use(markdownItHighLight)

md.use(markdownAnchor)
md.use(markdownTableOfContent, {
  includeLevel: [1, 2, 3]
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
      firstInit: true
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
    // 滚动事件
    scroll() {
      if (this.firstInit) {
        return console.log('this was the frist init!')
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

.mark {
  padding-right: 180px;
  padding-bottom: 30px;
}
.table-of-contents {
  position: fixed;
  right: 0;
  height: 100%;
  top: 0;
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
  & > ul {
    list-style-type: none;
    margin: 0;
    height: 100%;
    position: relative;
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 2px;
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
    padding-left: 15px;
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
