import { BasicWebChat, Composer } from 'botframework-webchat/component';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

function RunFunction({ fn }) {
  fn();

  return false;
}

export default function createRenderHook(
  /** @type {HTMLElement} */
  element,
  { directLine, renderWebChat, store }
) {
  const root = createRoot(element);

  return fn =>
    new Promise(resolve =>
      root.render(
        createElement(
          Composer,
          { directLine, store },
          ...[
            ...(renderWebChat ? [createElement(BasicWebChat)] : []),
            createElement(RunFunction, { fn: () => resolve(fn?.()), key: Date.now() })
          ]
        )
      )
    );
}
