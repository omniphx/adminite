module.exports = {
  externals: ['react', 'react-dom', 'react-dnd-html5-backend-cjs'],
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: 'css-loader'
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
        use: []
      }
    ]
  }
}
