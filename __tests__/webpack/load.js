// Runs the bundle in jsdom: it must not throw and every import must be defined.

const { readFileSync } = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const { resolve } = require('path');

const errors = [];
const virtualConsole = new VirtualConsole();

virtualConsole.on('jsdomError', error => errors.push(error));

const { window } = new JSDOM('<!DOCTYPE html>', { runScripts: 'outside-only', virtualConsole });

// Web Chat needs Web Streams and text encoding, which jsdom does not implement but Node.js does.
['ReadableStream', 'TextDecoder', 'TextEncoder', 'TransformStream', 'WritableStream'].forEach(name => {
  window[name] = globalThis[name];
});

try {
  window.eval(readFileSync(resolve(__dirname, 'dist/main.js'), 'utf8'));
} catch (error) {
  errors.push(error);
}

window.WebChatConsumer
  ? Object.entries(window.WebChatConsumer).forEach(
      ([name, value]) => value || errors.push(new Error(`Import "${name}" is ${value}.`))
    )
  : errors.push(new Error('The bundle did not run to the end.'));

// Multi-line messages need "%0A" in GitHub Actions annotations.
errors.forEach(error => console.log(`::error::${String(error?.stack || error).replace(/\n/gu, '%0A')}`));

console.log(errors.length ? `${errors.length} error(s).` : 'Loaded the bundle, every import is defined.');

process.exit(errors.length ? 1 : 0);
