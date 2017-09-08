const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const port = process.env.PORT || 9000;

function resolve(dir) {
  return path.resolve(__dirname, dir);
}

// Get a list of all installed apps.
const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source =>
  fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);

const apps = getDirectories(resolve('src'));

module.exports = {
  devtool: 'inline-source-map',

  entry: {
    rig: './lib/rig/index.js'
  },

  output: {
    filename: '[name].js',
    path: resolve('dist'),
    publicPath: './'
  },

  resolve: {
    extensions: ['*', '.js', '.vue', '.json'],
    enforceExtension: false,
    modules: ['node_modules'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolve('lib'),
      manifest$: resolve('manifest.json'),
      shared: resolve('lib/shared'),
      src: resolve('lib')
    }
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin(
      [
        { from: 'node_modules/keen-ui/dist/keen-ui.min.js', to: 'vendor/js/' }
      ],
      { ignore: ['.DS_Store'] }
    ),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['rig'],
      template: 'lib/rig/index.html',
      inject: true
    }),
    new HtmlWebpackIncludeAssetsPlugin({
      assets: ['vendor/js/keen-ui.min.js'],
      append: false
    }),
    new FriendlyErrorsPlugin()
  ],

  devServer: {
    port,
    hot: true,
    contentBase: path.resolve(__dirname, 'src'),
    publicPath: '/',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },

  resolveLoader: {
    alias: {
      'di-loader': path.resolve(__dirname, 'build', 'di-loader.js')
    }
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          { loader: 'vue-loader' },
          {
            loader: 'di-loader',
            options: { apps }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader' },
          {
            loader: 'di-loader',
            options: { apps }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.html$/,
        use: ['html-loader']
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1,
          name: path.posix.join('static', 'fonts/[name].[ext]')
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1,
          name: '[path][name].[ext]?[hash]',
          useRelativePaths: true
        }
      },
      {
        test: /\.(js|vue)$/,
        enforce: 'pre',
        exclude: /node_modules|libs/,
        use: [
          {
            loader: 'di-loader',
            options: { apps }
          }
        ]
      }

    ]
  }
};
