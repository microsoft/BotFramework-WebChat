/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { type ReactElement } from 'react';

type WebChatElementType = HTMLElement & { connectedCallback(): Promise<void>; props: object | undefined };

let numDefined = 0;

// Rendered Web Chat is a stub: these tests are about when the element renders, not what.
function ReactWebChat() {
  return null;
}

// Waits for promise callbacks and microtasks, such as the ones of `connectedCallback()` and `disconnectedCallback()`.
function settle() {
  // eslint-disable-next-line no-restricted-globals
  return new Promise(resolve => setTimeout(resolve));
}

// Loads a fresh copy of the module, which looks up React DOM once when it loads: `resolveReactDOMClient()` ends the lookup.
function setup() {
  const root = { render: jest.fn(), unmount: jest.fn() };
  const createRoot = jest.fn(() => root);
  let resolveReactDOMClient: (value: unknown) => void;
  let WebChatElement: CustomElementConstructor;

  jest.isolateModules(() => {
    // As in the static build: "react-dom/client" through `import()`, resolved later.
    jest.doMock('./private/requireReactDOMClient', () => new Promise(resolve => (resolveReactDOMClient = resolve)));
    jest.doMock('react-dom', () => ({ __esModule: true, default: {} }));
    jest.doMock('../FullReactWebChat', () => ({ __esModule: true, default: ReactWebChat }));

    ({ default: WebChatElement } = require('./WebChatElement'));
  });

  const name = `webchat-element-${++numDefined}`;

  customElements.define(name, WebChatElement);

  const element = document.createElement(name) as WebChatElementType;

  return {
    createRoot,
    element,
    resolveReactDOMClient: async (reactDOMClient: unknown = { createRoot }) => {
      resolveReactDOMClient(reactDOMClient);

      await settle();
    },
    root
  };
}

// Props of <ReactWebChat> in the last render: <Fragment><style /><Fragment key={nonce}><ReactWebChat /></Fragment></Fragment>.
function getLastWebChatProps(root: { render: jest.Mock }) {
  const [fragment]: [ReactElement<{ children: readonly ReactElement<{ children: ReactElement }>[] }>] =
    root.render.mock.calls.at(-1);

  return fragment.props.children[1].props.children.props;
}

const cleanUp = () => document.body.replaceChildren();

scenario(
  'WebChatElement while React DOM is looked up',
  bdd => {
    bdd
      .given(
        'an element with props, connected',
        () => {
          const preconditions = setup();

          preconditions.element.props = { directLine: {} };
          document.body.append(preconditions.element);

          return preconditions;
        },
        cleanUp
      )
      .when('a moment passes', () => settle())
      .then('should not render yet', ({ createRoot }) => expect(createRoot).not.toHaveBeenCalled())
      .when('React DOM is found', ({ resolveReactDOMClient }) => resolveReactDOMClient())
      .then('should create a root in the shadow root', ({ createRoot, element }) =>
        expect(createRoot.mock.calls).toEqual([[element.shadowRoot]])
      )
      .and('should render Web Chat, with the shadow root as styleOptions.stylesRoot', ({ element, root }) =>
        expect(getLastWebChatProps(root)).toHaveProperty('styleOptions.stylesRoot', element.shadowRoot)
      );

    bdd
      .given(
        'an element with props, connected, then removed',
        () => {
          const preconditions = setup();

          preconditions.element.props = {};
          document.body.append(preconditions.element);
          preconditions.element.remove();

          return preconditions;
        },
        cleanUp
      )
      .when('React DOM is found', ({ resolveReactDOMClient }) => resolveReactDOMClient())
      .then('should not render', ({ createRoot }) => expect(createRoot).not.toHaveBeenCalled())
      .when('the element is connected again', async ({ element }) => {
        document.body.append(element);

        await settle();
      })
      .then('should render', ({ createRoot }) => expect(createRoot).toHaveBeenCalledTimes(1));

    bdd
      .given(
        'an element with props, connected, removed and appended again',
        () => {
          const preconditions = setup();

          preconditions.element.props = {};
          document.body.append(preconditions.element);
          preconditions.element.remove();
          document.body.append(preconditions.element);

          return preconditions;
        },
        cleanUp
      )
      .when('React DOM is found', ({ resolveReactDOMClient }) => resolveReactDOMClient())
      .then('should create one root', ({ createRoot }) => expect(createRoot).toHaveBeenCalledTimes(1))
      .and('should not unmount', ({ root }) => expect(root.unmount).not.toHaveBeenCalled());

    bdd
      .given('React DOM is not found', async () => {
        const preconditions = setup();

        // Neither "react-dom/client" nor ReactDOM.render(): React 19 without "react-dom/client" in the import map.
        await preconditions.resolveReactDOMClient(null); // `undefined` would mean the default, `{ createRoot }`.

        return preconditions;
      })
      // Called directly: connecting the element would make it an unhandled rejection, which fails the test.
      .when('the element is connected', ({ element }) => element.connectedCallback().catch(error => error))
      .then('should reject, asking for "react-dom/client"', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining('map "react-dom/client" too'))
      );
  },
  JestGlobals
);

scenario(
  'WebChatElement after React DOM is found',
  bdd => {
    bdd
      .given(
        'a rendered element',
        async () => {
          const preconditions = setup();

          await preconditions.resolveReactDOMClient();

          preconditions.element.props = {};
          document.body.append(preconditions.element);

          await settle();

          return preconditions;
        },
        cleanUp
      )
      .when('the element moves to another parent', async ({ element }) => {
        document.body.append(document.createElement('div'));
        document.body.lastElementChild.append(element);

        await settle();
      })
      .then('should not unmount', ({ root }) => expect(root.unmount).not.toHaveBeenCalled())
      .when('the element is removed', async ({ element }) => {
        element.remove();

        await settle();
      })
      .then('should unmount', ({ root }) => expect(root.unmount).toHaveBeenCalledTimes(1));

    bdd
      .given(
        'a rendered element',
        async () => {
          const preconditions = setup();

          await preconditions.resolveReactDOMClient();

          preconditions.element.props = {};
          document.body.append(preconditions.element);

          await settle();

          return preconditions;
        },
        cleanUp
      )
      .when('props is set to undefined', ({ element }) => {
        element.props = undefined;
      })
      .then('should unmount', ({ root }) => expect(root.unmount).toHaveBeenCalledTimes(1))
      .when('props is set again', ({ element }) => {
        element.props = {};
      })
      .then('should create a new root', ({ createRoot }) => expect(createRoot).toHaveBeenCalledTimes(2));

    bdd
      .given(
        'a rendered element without a store in props',
        async () => {
          const preconditions = setup();

          await preconditions.resolveReactDOMClient();

          preconditions.element.props = {};
          document.body.append(preconditions.element);

          await settle();

          return { ...preconditions, firstStore: getLastWebChatProps(preconditions.root).store };
        },
        cleanUp
      )
      .when('props is set again, still without a store', ({ element }) => {
        element.props = { locale: 'en-US' };
      })
      .then('should render with the same store, created by the element', ({ firstStore, root }) => {
        expect(firstStore).toHaveProperty('dispatch', expect.any(Function));
        expect(getLastWebChatProps(root).store).toBe(firstStore);
      })
      .when('props is set to undefined and set again', ({ element }) => {
        element.props = undefined;
        element.props = {};
      })
      .then('should render with a new store: the old one went with the unmount', ({ firstStore, root }) =>
        expect(getLastWebChatProps(root).store).not.toBe(firstStore)
      );

    bdd
      .given(
        'a rendered element with a store in props',
        async () => {
          const preconditions = setup();
          const store = { dispatch: () => undefined };

          await preconditions.resolveReactDOMClient();

          preconditions.element.props = { store };
          document.body.append(preconditions.element);

          await settle();

          return { ...preconditions, store };
        },
        cleanUp
      )
      .when('rendered', () => undefined)
      .then('should render with the store of the host', ({ root, store }) =>
        expect(getLastWebChatProps(root).store).toBe(store)
      );

    bdd
      .given('an element', () => setup())
      .when('props has a nonce that is not a string', ({ element }) => {
        try {
          element.props = { nonce: 123 };
        } catch (error) {
          return error;
        }
      })
      .then('should throw', (_, error) => expect(error).toBeInstanceOf(Error))
      .and('should keep props unset', ({ element }) => expect(element.props).toBeUndefined());
  },
  JestGlobals
);
