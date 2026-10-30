// Same in every app folder (CI diffs them): a Web Chat app, rendering a message from a fake chat adapter.
// index.js (React 18 and later) and index.react16.js render it.

import ReactWebChat, { createDirectLine, renderWebChat } from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import { Composer } from 'botframework-webchat/component.js';
import { WebChatDecorator } from 'botframework-webchat/decorator.js';
import { useActivities } from 'botframework-webchat/hook.js';
import { createActivityPolymiddleware } from 'botframework-webchat/middleware.js';
import { createElement } from 'react';

import createFakeDirectLine from './createFakeDirectLine.js';

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

export default createElement(
  FluentThemeProvider,
  {},
  createElement(ReactWebChat, { directLine: createFakeDirectLine() })
);
