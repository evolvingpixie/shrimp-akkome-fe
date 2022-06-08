var path = require('path')
var config = require('../config')
var utils = require('./utils')
var projectRoot = path.resolve(__dirname, '../')
var ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin')
var CopyPlugin = require('copy-webpack-plugin');
var { VueLoaderPlugin } = require('vue-loader')

var env = process.env.NODE_ENV
// check env & config/index.js to decide weither to enable CSS Sourcemaps for the
// various preprocessor loaders added to vue-loader at the end of this file
var cssSourceMapDev = (env === 'development' && config.dev.cssSourceMap)
var cssSourceMapProd = (env === 'production' && config.build.productionSourceMap)
var useCssSourceMap = cssSourceMapDev || cssSourceMapProd

var now = Date.now()

module.exports = {
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath,
    filename: '[name].js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  resolve: {
    extensions: ['.js', '.jsx', '.vue'],
    modules: [
      path.join(__dirname, '../node_modules')
    ],
    alias: {
      'static': path.resolve(__dirname, '../static'),
      'src': path.resolve(__dirname, '../src'),
      'assets': path.resolve(__dirname, '../src/assets'),
      'components': path.resolve(__dirname, '../src/components'),
      'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js'
    }
  },
  module: {
    noParse: /node_modules\/localforage\/dist\/localforage.js/,
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|vue)$/,
        include: projectRoot,
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter'),
            sourceMap: config.build.productionSourceMap,
            extract: true
          }
        }
      },
      {
        enforce: 'post',
        test: /\.(json5?|ya?ml)$/, // target json, json5, yaml and yml files
        type: 'javascript/auto',
        loader: '@intlify/vue-i18n-loader',
        include: [ // Use `Rule.include` to specify the files of locale messages to be pre-compiled
          path.resolve(__dirname, '../src/i18n')
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            isCustomElement(tag) {
              if (tag === 'pinch-zoom') {
                return true
              }
              return false
            }
          }
        }
      },
      {
        test: /\.jsx?$/,
        include: projectRoot,
        exclude: /node_modules\/(?!tributejs)/,
        use: 'babel-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('img/[name].[hash:7].[ext]')
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
          }
        }
      },
    ]
  },
  plugins: [
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, '..', 'src/sw.js'),
      filename: 'sw-pleroma.js'
    }),
    new VueLoaderPlugin(),
    // This copies Ruffle's WASM to a directory so that JS side can access it
    new CopyPlugin({
      patterns: [
        {
          from: "node_modules/ruffle-mirror/*",
          to: "static/ruffle",
          flatten: true
        },
      ],
      options: {
        concurrency: 100,
      },
    })
  ]
}
