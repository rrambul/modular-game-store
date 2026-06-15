const path = require('path');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');
const { HtmlRspackPlugin } = require('@rspack/core');
const { withZephyr } = require('zephyr-webpack-plugin');

// Opt out of Zephyr (e.g. CI / offline builds) with DISABLE_ZEPHYR=1.
const wrap = process.env.DISABLE_ZEPHYR ? (config) => config : withZephyr();

/** @type {import('@rspack/core').Configuration} */
module.exports = wrap({
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'auto',
    clean: true,
    uniqueName: 'cart',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  devServer: {
    port: 3001,
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
    new ModuleFederationPlugin({
      name: 'cart',
      filename: 'remoteEntry.js',
      // Consumers type these via the host's src/remotes.d.ts; skip auto-generation.
      dts: false,
      exposes: {
        './CartWidget': './src/components/CartWidget',
        './CartPage': './src/components/CartPage',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.0' },
      },
    }),
    new HtmlRspackPlugin({
      template: './public/index.html',
      title: 'Cart MF — Standalone',
    }),
  ],
});
