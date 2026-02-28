const path = require('path');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');
const { HtmlRspackPlugin } = require('@rspack/core');
const { withZephyr } = require('zephyr-webpack-plugin');

/** @type {import('@rspack/core').Configuration} */
module.exports = withZephyr()({
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'auto',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  devServer: {
    port: 3000,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
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
      name: 'store',
      // No static remotes — all loaded dynamically at runtime
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.0' },
      },
    }),
    new HtmlRspackPlugin({
      template: './public/index.html',
      title: 'Modular Game Store',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'async',
    },
  },
});
