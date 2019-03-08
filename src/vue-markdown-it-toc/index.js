/**
 * @file index.js
 * @desc {{description}}{{markdown-it toc entry}}
 * @createTime 2019-03-08 16:28:59
 * @author {{muzi131313}} {{muzi131313@163.com}}{{}}
 */
import markdownItToc from './markdownItToc'

const install = (Vue, opts = {}) => {
  // 如果安装过就忽略
  if (install.installed) return

  Vue.component(markdownItToc.name, markdownItToc)
}

// 自动安装 方便打包成压缩文件, 用<script scr=''></script>的方式引用
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export const MarkdownItToc = markdownItToc

export default {
  install
}
