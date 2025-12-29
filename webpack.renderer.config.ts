import type { Configuration } from 'webpack';
import path from 'path';
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const rendererConfig: Configuration = {
  target: 'electron-renderer',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|ttf|eot|ico|icns)$/,
        type: 'asset/resource'
      },
      {
        test: /\.mjs$/,
        type: 'javascript/auto'
      }
    ]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin()
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.less']
  }
};
