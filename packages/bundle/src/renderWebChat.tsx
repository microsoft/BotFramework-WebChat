import { reactNode } from '@msinternal/botframework-webchat-react-valibot';
import React, { type ComponentType, type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { args, custom, function_, is, object, picklist, pipe, tuple } from 'valibot';

/** A root from `createRoot()` of "react-dom/client". */
type RenderWebChatRoot = { render(children: ReactNode): void };

/** Containers `ReactDOM.render()` accepts, `null` included as in its typings (it throws at run time). */
type RenderWebChatContainer = Element | Document | DocumentFragment | null;

type RenderWebChat = {
  /**
   * Renders Web Chat into an element, or with a root from `createRoot()`.
   *
   * @param props Props of `<ReactWebChat>`.
   * @param elementOrRoot Element to render Web Chat into with `ReactDOM.render()`, or a root from `createRoot()` of "react-dom/client" to render Web Chat with.
   *    React 19 or later removed `ReactDOM.render()`: pass `createRoot(element)` instead of the element.
   * @throws When an element is passed on React 19 or later, or when `elementOrRoot` is neither an element nor a root.
   */
  (props: any, elementOrRoot: RenderWebChatContainer | RenderWebChatRoot): void;
};

// Same as `Node.ELEMENT_NODE`, `Node.DOCUMENT_NODE` and `Node.DOCUMENT_FRAGMENT_NODE`, without needing `Node` on import.
const ELEMENT_NODE = 1;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;

// Containers `ReactDOM.render()` accepts: element, document and document fragment, by `nodeType` to work across realms.
// Checked before `reactRootSchema`: some custom elements (e.g. Lit) have their own `render()` method.
const containerSchema = custom<Exclude<RenderWebChatContainer, null>>(value =>
  is(object({ nodeType: picklist([DOCUMENT_FRAGMENT_NODE, DOCUMENT_NODE, ELEMENT_NODE]) }), value)
);

// `ReactDOM.render(children, container)`, React 18 or earlier.
const legacyReactDOMSchema = object({ render: pipe(function_(), args(tuple([reactNode(), containerSchema]))) });

// `root.render(children)`, root from `createRoot()` of "react-dom/client".
const reactRootSchema = object({ render: pipe(function_(), args(tuple([reactNode()]))) });

export default function renderWebChat(
  ReactWebChat: ComponentType<any>,
  props: any,
  elementOrRoot: RenderWebChatContainer | RenderWebChatRoot
): void {
  const children = <ReactWebChat {...props} />;

  if (is(containerSchema, elementOrRoot)) {
    // React 19 or later removed `ReactDOM.render()`: Web Chat does not import "react-dom/client", the host creates the root.
    if (!is(legacyReactDOMSchema, ReactDOM)) {
      throw new Error(
        'botframework-webchat: renderWebChat() on React 19 or later needs a root: pass createRoot(element) from "react-dom/client" instead of the element.'
      );
    }

    // React 16 to 18, and Preact. Also the IIFE build, which bundles React DOM 16.8.6 unless `window.ReactDOM` is set.
    ReactDOM.render(children, elementOrRoot);
  } else if (is(reactRootSchema, elementOrRoot)) {
    // The host created the root: render with it on any React version, it is the host's to unmount.
    elementOrRoot.render(children);
  } else {
    throw new Error('botframework-webchat: renderWebChat() expects an HTMLElement or a root from createRoot().');
  }
}

export { type RenderWebChat, type RenderWebChatContainer, type RenderWebChatRoot };
