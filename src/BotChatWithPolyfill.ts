export * from './BotChat';

// Polyfill Promise if needed
if (typeof (window as any).Promise === 'undefined') {
  (window as any).Promise = require('bluebird');
}
