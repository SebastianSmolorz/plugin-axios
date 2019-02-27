const path = require('path');

module.exports = {
  entry: './src/index.js',
  target: 'node',
  output: {
    library: 'vuex-orm-axios',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        // exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  ie: 11,
                },
                useBuiltIns: 'usage',
                modules: false,
                debug: true,
              }],
            ],


            plugins: [
              ['@babel/plugin-transform-modules-commonjs', {
                allowTopLevelThis: true,
                strict: true,
              }],
              '@babel/plugin-transform-runtime',
            ],
          },
        },
      },
    ],
  },
};
