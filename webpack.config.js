const {join, resolve} = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const DependencyExtractionPlugin = require('@wordpress/dependency-extraction-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const {HotModuleReplacementPlugin, NoEmitOnErrorsPlugin} = require('webpack')
const WebpackBar = require('webpackbar')
const WriteFilePlugin = require('write-file-webpack-plugin')

/**
 * Webpack utilities
 *
 * @return {bool}
 */
const isProduction = process.env.NODE_ENV === 'production'
const isHMR = process.env.NODE_ENV === 'hmr'

/**
 * Webpack Configuration
 */
module.exports = {
  entry: [
    join(__dirname, 'src/disable-welcome-modal.js'),
  ],
  context: join(__dirname, 'src'),
  devServer: {
    disableHostCheck: true,
  },
  output: {
    path: resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: '[name].js',
    chunkFilename: '[id].css',
    sourceMapFilename: '[file].map',
  },
  devtool: isProduction ? false : 'inline-source-map',
  mode: isProduction ? 'production' : 'development',
  resolve: {
    alias: {
      '@blocks': resolve(__dirname, 'src/blocks'),
      '@components': resolve(__dirname, 'src/components'),
      '@extensions': resolve(__dirname, 'src/extensions'),
      '@hooks': resolve(__dirname, 'src/hooks'),
    },
    extensions: ['.js', '.json', '.jsx', '.css'],
    modules: [resolve(__dirname, 'node_modules')],
  },
  optimization: {
    minimizer: isProduction ? [new UglifyJsPlugin()] : [],
    splitChunks: {
      chunks: 'all',
    },
  },
  stats: {
    all: false,
    assets: true,
    errors: true,
    timings: true,
  },
  target: 'web',
  watch: global.watch || false,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: join(__dirname, 'src'),
        use: [{loader: 'babel-loader'}, {loader: 'eslint-loader'}],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new DependencyExtractionPlugin({
      injectPolyfill: false,
      outputFormat: 'json',
    }),
    new ManifestPlugin({
      path: join(__dirname, 'dist'),
      writeToFileEmit: true,
      chunkFilename: 'manifest.json',
    }),
    new FriendlyErrorsPlugin(),
    ...(isHMR
      ? [
          new HotModuleReplacementPlugin(),
          new NoEmitOnErrorsPlugin(),
          new WriteFilePlugin(),
        ]
      : [new WebpackBar()]),
  ],
}
