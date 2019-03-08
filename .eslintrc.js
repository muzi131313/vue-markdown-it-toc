module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // else/catch换行
    // doc: http://eslint.cn/docs/4.0.0/rules/brace-style
    "brace-style": ["error", "stroustrup"],
    // 多个条件判断符号，放到前面
    "operator-linebreak": ["error", "before"],
    // function名称后，括号前不要空格
    "space-before-function-paren": 0,
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
