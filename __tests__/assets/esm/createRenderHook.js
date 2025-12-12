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
  props,
  { renderWebChat } = {}
) {
  const root = createRoot(element);

  return fn =>
    new Promise(resolve =>
      root.render(
        createElement(
          Composer,
          props,
          ...[
            ...(renderWebChat ? [createElement(BasicWebChat)] : []),
            createElement(RunFunction, { fn: () => resolve(fn?.()), key: Date.now() })
          ]
        )
      )
    );
}
