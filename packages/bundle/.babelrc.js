module.exports = {
  env: {
    test: {
      plugins: ['babel-plugin-istanbul']
    }
  },
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
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
        targets: {
          browsers: ['last 2 versions']
        },
        modules: 'commonjs'
      }
    ],
    '@babel/react'
  ],
  sourceMaps: 'inline',
  sourceRoot: 'bundle:///'
};
