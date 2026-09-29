const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  
  return {
    entry: './src/renderer/index.tsx',
    target: 'electron-renderer',
    mode: argv.mode || 'development',
    devtool: isDevelopment ? 'source-map' : false,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'renderer.js',
      path: path.resolve(__dirname, 'dist'),
      clean: false,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/renderer/index.html',
        filename: 'index.html',
      }),
    ],
    externals: {
      electron: 'require("electron")',
    },
  };
};