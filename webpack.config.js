const path = require('path');

module.exports = {
  entry: './app/main.js', // your entry point
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './public'), // output location of bundle.js file
    filename: 'bundle.js',
  },
  devtool: 'source-maps',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
