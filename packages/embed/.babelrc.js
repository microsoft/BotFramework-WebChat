module.exports = {
  env: {
    test: {
      plugins: ['babel-plugin-istanbul']
    }
  },
  plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/plugin-transform-runtime'],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          ie: '11'
        },
        modules: 'commonjs'
      }
    ]
  ],
  sourceMaps: 'inline',
  sourceRoot: 'embed'
};
