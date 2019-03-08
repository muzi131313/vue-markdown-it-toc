// doc: https://github.com/NightCatSama/vue-slider-component/blob/master/webpack.config.js
// doc: https://juejin.im/post/586f8252128fe1006b1ebf9e
// webpack4: https://github.com/dwqs/blog/issues/60
var path = require('path')
// var webpack = require('webpack')
var VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: './src/drag-slider/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js',
    library: 'vue-drag-slider',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.js', '.vue']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        // include: __dirname,
        exclude: /node_modules/
      }, {
        test: /\.vue$/,
        use: 'vue-loader',
        // include: __dirname,
        exclude: /node_modules/
        // options: {
        //   postcss: {
        //     config: {
        //       path: path.resolve(__dirname, './postcss.config.js')
        //     }
        //   }
        // }
      }, {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader'
            // ,
            // options: {
            //   // 你也可以从一个文件读取，例如 `variables.scss`
            //   data: `$color: red;`
            // }
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}
