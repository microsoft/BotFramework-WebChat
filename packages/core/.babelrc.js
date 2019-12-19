module.exports = {
  env: {
    test: {
      plugins: ['babel-plugin-istanbul']
    }
  },
  plugins: [
    '@babel/proposal-object-rest-spread',
    '@babel/plugin-transform-runtime',
    [
      'transform-inline-environment-variables',
      {
        include: ['npm_package_version']
      }
    ]
  ],
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        forceAllTransforms: true,
        modules: 'commonjs'
      }
    ]
  ],
  sourceMaps: 'inline',
  sourceRoot: 'core:///'
};
