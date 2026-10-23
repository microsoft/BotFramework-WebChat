import React, { type ComponentType, type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { function_, is, object } from 'valibot';

import importReactDOMClient from './private/importReactDOMClient';

type Root = { render(children: ReactNode): void };

const createRootSchema = object({ createRoot: function_() });
// Both `ReactDOM.render()` (React 18 or earlier) and `root.render()`.
const renderSchema = object({ render: function_() });

// `createRoot()` can only be called once per element, rendering again reuses its root.
const rootByElement = new WeakMap<HTMLElement, Root>();

function createRootRequiredError(cause?: unknown): Error {
  return new Error(
    'botframework-webchat: renderWebChat() needs createRoot() from "react-dom/client" on React 19 or later. Render <ReactWebChat> with createRoot() instead, or add "react-dom/client" to the import map of the ESM build.',
    { cause }
  );
}

async function renderWithCreateRoot(children: ReactNode, element: HTMLElement): Promise<void> {
  // Static (ESM) build: "react-dom/client" is imported through the import map of the page.
  // npm and IIFE builds resolve to `undefined`: they cannot import "react-dom/client" (bundlers would fail on React 16 and 17),
  // the host must render <ReactWebChat> with `createRoot()` itself.
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
  element: HTMLElement
): Promise<void> {
  const children = <ReactWebChat {...props} />;

  if (is(renderSchema, ReactDOM)) {
    // React 16 to 18, and Preact: render synchronously as before, the returned promise is already resolved.
    // Also the IIFE build, which bundles React DOM 16.8.6 unless `window.ReactDOM` is set,
    // and the static (ESM) build with the React 18 of its import map.
    ReactDOM.render(children, element);
  } else {
    // React 19 or later: `ReactDOM.render()` was removed, `createRoot()` is only in "react-dom/client".
    await renderWithCreateRoot(children, element);
  }
}
