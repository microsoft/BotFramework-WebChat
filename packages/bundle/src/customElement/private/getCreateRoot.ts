import { type ReactNode } from 'react';
import { custom, function_, is, object } from 'valibot';

import { legacyReactDOMSchema } from '../../private/reactDOMSchemas';

/** A root to render Web Chat into the shadow root with, and to unmount it. */
type WebChatElementRoot = { readonly render: (children: ReactNode) => void; readonly unmount: () => void };

type CreateWebChatElementRoot = (shadowRoot: ShadowRoot) => WebChatElementRoot;

// "react-dom/client" of React 18 and later.
const reactDOMClientSchema = object({ createRoot: function_() });

// `ReactDOM.render()` and `ReactDOM.unmountComponentAtNode()` of React 16 and 17 (React 18 has them too, deprecated).
const legacyReactDOMWithUnmountSchema = object({
  ...legacyReactDOMSchema.entries,
  unmountComponentAtNode: function_()
});

// Keeps the root as-is: `object()` would copy its methods without `this`.
const rootSchema = custom<WebChatElementRoot>(value =>
  is(object({ render: function_(), unmount: function_() }), value)
);

/**
 * Picks how to render into a shadow root: `createRoot()` of "react-dom/client" (React 18 and later), else
 * `ReactDOM.render()` (React 16 and 17).
 *
 * @throws When neither is found.
 */
export default function getCreateRoot(reactDOMClient: unknown, reactDOM: unknown): CreateWebChatElementRoot {
  if (is(reactDOMClientSchema, reactDOMClient)) {
    return shadowRoot => {
      const root = reactDOMClient.createRoot(shadowRoot);

      if (!is(rootSchema, root)) {
        throw new Error('botframework-webchat: createRoot() of "react-dom/client" did not return a root.');
      }

      return root;
    };
  } else if (is(legacyReactDOMWithUnmountSchema, reactDOM)) {
    // React 16 listens to events on the container only if it is a document or a shadow root: render into the shadow root itself.
    // React 16 empties the container when it first renders: Web Chat adds its styles afterwards, in effects.
    return shadowRoot =>
      Object.freeze({
        render: (children: ReactNode) => reactDOM.render(children, shadowRoot),
        unmount: () => {
          reactDOM.unmountComponentAtNode(shadowRoot);
        }
      });
  }

  throw new Error(
    'botframework-webchat: WebChatElement needs createRoot() of "react-dom/client" (React 18 and later) or ReactDOM.render() of "react-dom" (React 16 and 17). With an import map, map "react-dom/client" too.'
  );
}

export { type CreateWebChatElementRoot, type WebChatElementRoot };
