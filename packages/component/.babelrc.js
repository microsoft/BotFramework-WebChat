module.exports = {
  env: {
    test: {
      exclude: ['src/**/*.worker.js'],
      plugins: ['babel-plugin-istanbul']
    }
  },
  overrides: [
    {
      test: 'src/**/*.worker.js',
      plugins: [],
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              chrome: '69'
            }
          }
        ]
      ]
    }
  ],
  plugins: [
    '@babel/proposal-object-rest-spread',
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
  sourceRoot: 'component:///'
};
