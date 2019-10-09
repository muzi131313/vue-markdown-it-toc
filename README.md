# vue-markdown-it-toc
markdown-it toc components

- add toc base css
- when scroll the page, set the active toc item
- support set offset to the header

### usage
- example
  - [vue-markdown-it-toc github](https://gitee.com/muzi131313/markdown-it-toc-demo)
  - [vue-markdown-it-toc online demo](https://muzi131313.github.io/vue-markdown-it-toc-demo/)
- import the component plugins
  ````
  import Vue from 'vue'
  import MarkdownItToc from 'vue-markdown-it-toc'
  Vue.use(MarkdownItToc)
  ````
- use in vue project
  - template
    ````
    <markdown-it-toc class="markdown-it-wrap"
      :content="content"
      :offset="21"
      :level="3">
    </markdown-it-toc>
    ````
  - css
    ````
    .markdown-it-wrap {
      width: 1140px;
      margin: 0 auto;
      padding-right: 165px;
      box-sizing: border-box;
    }
    ````
### questions
- if the css style does not satisfy your usage scence, then you can rewrite the toc style that was wraped by the `.table-of-contents` css
