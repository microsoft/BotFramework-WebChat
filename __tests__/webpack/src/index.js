import ReactWebChat, { createDirectLine, renderWebChat } from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import { Composer } from 'botframework-webchat/component.js';
import { WebChatDecorator } from 'botframework-webchat/decorator.js';
import { useActivities } from 'botframework-webchat/hook.js';
import { createActivityPolymiddleware } from 'botframework-webchat/middleware.js';

// load.js checks that every import is defined. "botframework-webchat/schema.js" is imported by the Fluent theme.
window.WebChatConsumer = Object.freeze({
  Composer,
  createActivityPolymiddleware,
  createDirectLine,
  FluentThemeProvider,
  ReactWebChat,
  renderWebChat,
  useActivities,
  WebChatDecorator
});
