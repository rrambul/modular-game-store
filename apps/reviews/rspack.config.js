const path = require('path');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');
const { HtmlRspackPlugin, DefinePlugin } = require('@rspack/core');
const { withZephyr } = require('zephyr-webpack-plugin');

const version = process.env.VERSION || require('./package.json').version;

/** @type {import('@rspack/core').Configuration} */
module.exports = withZephyr()({
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist', `v${version}`),
    publicPath: 'auto',
    clean: true,
    uniqueName: `reviews_v${version}`,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  devServer: {
    port: 3002,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              transform: { react: { runtime: 'automatic' } },
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ['postcss-loader'],
        type: 'css/auto',
      },
    ],
  },
  experiments: { css: true },
  plugins: [
    new DefinePlugin({
      'process.env.MF_VERSION': JSON.stringify(version),
    }),
    new ModuleFederationPlugin({
      name: 'reviews',
      filename: 'remoteEntry.js',
      exposes: {
        './ReviewList': './src/components/ReviewList',
        './ReviewForm': './src/components/ReviewForm',
        './ReviewSummary': './src/components/ReviewSummary',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.0' },
      },
    }),
    new HtmlRspackPlugin({
      template: './public/index.html',
      title: 'Reviews MF — Standalone',
    }),
  ],
});
