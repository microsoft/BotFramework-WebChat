import React, { type ComponentType, type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { custom, function_, is, literal, object } from 'valibot';

import importReactDOMClient from './private/importReactDOMClient';

/** A root from `createRoot()` of "react-dom/client". */
type RenderWebChatRoot = { render(children: ReactNode): void };

type RenderWebChat = {
  /**
   * Renders Web Chat into an element, or with a root from `createRoot()`.
   *
   * @param props Props of `<ReactWebChat>`.
   * @param elementOrRoot Element to render Web Chat into, or a root from `createRoot()` of "react-dom/client" to render Web Chat with on any React version.
   *    On React 19 or later, the npm and IIFE builds need a root: they cannot import "react-dom/client".
   * @returns A promise resolving when Web Chat is rendered, rejecting when it cannot be rendered.
   */
  (props: any, elementOrRoot: HTMLElement | RenderWebChatRoot): Promise<void>;
};

const createRootSchema = object({ createRoot: function_() });
// Checked before `renderSchema`: some custom elements (e.g. Lit) have their own `render()` method.
const elementSchema = custom<HTMLElement>(value => is(object({ nodeType: literal(1) }), value));
// Both `ReactDOM.render()` (React 18 or earlier) and `root.render()`.
const renderSchema = object({ render: function_() });

// `createRoot()` can only be called once per element, rendering again reuses its root.
const rootByElement = new WeakMap<HTMLElement, RenderWebChatRoot>();

function createRootRequiredError(cause?: unknown): Error {
  return new Error(
    'botframework-webchat: renderWebChat() needs createRoot() from "react-dom/client" on React 19 or later. Pass a root from createRoot() instead of the element, or add "react-dom/client" to the import map of the ESM build.',
    { cause }
  );
}

async function renderWithCreateRoot(children: ReactNode, element: HTMLElement): Promise<void> {
  // Static (ESM) build: "react-dom/client" is imported through the import map of the page.
  // npm and IIFE builds resolve to `undefined`: they cannot import "react-dom/client" (bundlers would fail on React 16 and 17),
  // the host must pass a root from `createRoot()` instead of the element.
  const reactDOMClient = await importReactDOMClient().catch(error => {
    throw createRootRequiredError(error);
  });

  if (!is(createRootSchema, reactDOMClient)) {
    throw createRootRequiredError();
  }

  let root = rootByElement.get(element);

  if (!root) {
    const createdRoot = reactDOMClient.createRoot(element);

    if (!is(renderSchema, createdRoot)) {
      throw new Error('botframework-webchat: createRoot() did not return a root.');
    }

    rootByElement.set(element, (root = createdRoot));
  }

  root.render(children);
}

export default async function renderWebChat(
  ReactWebChat: ComponentType<any>,
  props: any,
  elementOrRoot: HTMLElement | RenderWebChatRoot
): Promise<void> {
  const children = <ReactWebChat {...props} />;

  if (is(elementSchema, elementOrRoot)) {
    if (is(renderSchema, ReactDOM)) {
      // React 16 to 18, and Preact: render synchronously as before, the returned promise is already resolved.
      // Also the IIFE build, which bundles React DOM 16.8.6 unless `window.ReactDOM` is set,
      // and the static (ESM) build with the React 18 of its import map.
      ReactDOM.render(children, elementOrRoot);
    } else {
      // React 19 or later: `ReactDOM.render()` was removed, `createRoot()` is only in "react-dom/client".
      await renderWithCreateRoot(children, elementOrRoot);
    }
  } else if (is(renderSchema, elementOrRoot)) {
    // The host created the root: render with it on any React version, it is the host's to unmount.
    elementOrRoot.render(children);
  } else {
    throw new Error('botframework-webchat: renderWebChat() expects an HTMLElement or a root from createRoot().');
  }
}

export { type RenderWebChat, type RenderWebChatRoot };
