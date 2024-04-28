module.exports = {
  all: true,
  exclude: ['**/*.worker.js'], // Seems doesn't work.
  extends: '@istanbuljs/nyc-config-typescript'
};
