/* global __dirname, require, module */

const webpack = require('webpack')
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
const path = require('path')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const env = require('yargs').argv.env // use --env with webpack 2
let libraryName = 'Observable'

const resolve = (dir) => {
  return path.join(__dirname, './', dir)
}

let plugins = [
  new webpack.BannerPlugin('This file is created by FDD'),
  new FriendlyErrorsPlugin(),
  new webpack.NoEmitOnErrorsPlugin()
]

let outputFile

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({
    minimize: false
  }))
  outputFile = libraryName + '.min.js'
} else {
  outputFile = libraryName + '.js'
}

const config = {
  entry: [
    path.resolve(__dirname + '/src/index.js')
  ],
  devtool: '#source-map',
  output: {
    path: __dirname + '/dist',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        enforce: 'pre',  // 在babel-loader对源码进行编译前进行lint的检查
        loader: 'eslint-loader',
        include: [resolve('src'), resolve('test')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /(\.js)$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      }
    ]
  },
  resolve: {
    extensions: ['.json', '.js'],
    alias: {
      '@': resolve('src')
    }
  },
  plugins: plugins
}

module.exports = config
