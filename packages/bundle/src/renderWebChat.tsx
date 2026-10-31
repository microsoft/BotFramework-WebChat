import React, { type ComponentType, type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { is } from 'valibot';

import {
  containerSchema,
  legacyReactDOMSchema,
  react16DOMSchema,
  reactRootSchema,
  shadowRootSchema,
  type RenderWebChatContainer
} from './private/reactDOMSchemas';

/** A root from `createRoot()` of "react-dom/client". */
type RenderWebChatRoot = { render(children: ReactNode): void };

type RenderWebChat = {
  /**
   * Renders Web Chat into an element, or with a root from `createRoot()`.
   *
   * @param props Props of `<ReactWebChat>`.
   * @param elementOrRoot Element to render Web Chat into with `ReactDOM.render()`, or a root from `createRoot()` of "react-dom/client" to render Web Chat with.
   *    React 19 or later removed `ReactDOM.render()`: pass `createRoot(element)` instead of the element.
   * @throws When an element is passed on React 19 or later, an element inside a shadow root on React 16, or when `elementOrRoot` is neither an element nor a root.
   */
  (props: any, elementOrRoot: RenderWebChatContainer | RenderWebChatRoot): void;
};

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

    const rootNode = elementOrRoot.getRootNode?.();

    // React 16 listens to events on the document, unless the container is a document or a shadow root.
    // In a shadow root, the document gets events retargeted to the shadow host, React 16 would ignore every click and keystroke.
    // React 17 listens on the container: remove when React 16 is dropped.
    if (is(react16DOMSchema, ReactDOM) && rootNode !== elementOrRoot && is(shadowRootSchema, rootNode)) {
      throw new Error(
        'botframework-webchat: renderWebChat() on React 16 does not support an element inside a shadow root, React 16 would ignore clicks and typing. Pass the shadow root itself instead of the element, or use React 17 or later (with webchat.js, set window.React and window.ReactDOM before loading it).'
      );
    }

    // React 16 to 18, and Preact. Also the IIFE build, which bundles React DOM 16.8.6 unless `window.ReactDOM` is set.
    ReactDOM.render(children, elementOrRoot);
  } else if (is(reactRootSchema, elementOrRoot)) {
    // The host created the root: render with it on any React version, it is the host's to unmount.
    elementOrRoot.render(children);
  } else {
    throw new Error(
      'botframework-webchat: renderWebChat() expects an HTMLElement or a root from ReactDOM.createRoot().'
    );
  }
}

export { type RenderWebChat, type RenderWebChatContainer, type RenderWebChatRoot };
