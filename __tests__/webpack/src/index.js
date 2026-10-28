import ReactWebChat, { createDirectLine, renderWebChat } from 'botframework-webchat';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import { Composer } from 'botframework-webchat/component.js';
import { useActivities } from 'botframework-webchat/hook.js';
import { createActivityPolymiddleware } from 'botframework-webchat/middleware.js';
import { createElement } from 'react';
import { render } from 'react-dom';

// Renders Web Chat in both themes like apps do. load.js only checks that every import is defined.
window.WebChatConsumer = Object.freeze({
  Composer,
  createActivityPolymiddleware,
  FluentThemeProvider,
  ReactWebChat,
  render: token => {
    const directLine = createDirectLine({ token });

    renderWebChat({ directLine }, document.getElementById('webchat'));

    // TODO: Use createRoot() from "react-dom/client" when React 19 joins the matrix.
    render(
      createElement(FluentThemeProvider, {}, createElement(ReactWebChat, { directLine })),
      document.getElementById('fluent-webchat')
    );
  },
  renderWebChat,
  useActivities
});
