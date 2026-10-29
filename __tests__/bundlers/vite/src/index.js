// Same in every app folder (CI diffs them): a Web Chat app, rendering a message from a fake chat adapter.

import ReactWebChat, { createDirectLine, renderWebChat } from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import { Composer } from 'botframework-webchat/component.js';
import { WebChatDecorator } from 'botframework-webchat/decorator.js';
import { useActivities } from 'botframework-webchat/hook.js';
import { createActivityPolymiddleware } from 'botframework-webchat/middleware.js';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client'; // On React 16, the bundler config points it to react-dom-client.react16.js.

// Every import must be defined: a bundler can resolve a subpath to an empty module without an error.
// "botframework-webchat/schema.js" is imported by the Fluent theme.
Object.entries({
  Composer,
  createActivityPolymiddleware,
  createDirectLine,
  FluentThemeProvider,
  ReactWebChat,
  renderWebChat,
  useActivities,
  WebChatDecorator
}).forEach(([name, value]) => {
  if (!value) {
    throw new Error(`Import "${name}" is ${value}.`);
  }
});

// Emits the values on every subscription, asynchronously like DirectLineJS.
function observableOf(...values) {
  return Object.freeze({
    subscribe: ({ next }) => {
      const timeout = setTimeout(() => values.forEach(value => next(value)));

      return Object.freeze({ unsubscribe: () => clearTimeout(timeout) });
    }
  });
}

// A chat adapter that connects at once and receives one message from the bot.
const directLine = Object.freeze({
  activity$: observableOf({
    from: { id: 'bot', role: 'bot' },
    id: 'a-00001',
    text: 'Hello from the bot.',
    timestamp: new Date().toISOString(),
    type: 'message'
  }),
  connectionStatus$: observableOf(0, 1, 2), // Uninitialized, connecting, online.
  end: () => undefined,
  postActivity: () => observableOf('a-00002')
});

createRoot(document.getElementById('webchat')).render(
  createElement(FluentThemeProvider, {}, createElement(ReactWebChat, { directLine }))
);
