/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';

import getCreateRoot from './getCreateRoot';

function createReactDOMMocks() {
  const root = { render: jest.fn(), unmount: jest.fn() };

  return {
    createRoot: jest.fn(() => root),
    render: jest.fn(),
    root,
    shadowRoot: document.createElement('div').attachShadow({ mode: 'open' }),
    unmountComponentAtNode: jest.fn()
  };
}

type ReactDOMMocks = ReturnType<typeof createReactDOMMocks>;

scenario(
  'getCreateRoot() with "react-dom/client"',
  bdd => {
    bdd.given
      .oneOf<ReactDOMMocks & { readonly reactDOM: object; readonly reactDOMClient: object }>([
        // React 18 has both, `ReactDOM.render()` is deprecated.
        [
          'React 18',
          () => {
            const mocks = createReactDOMMocks();
            const { createRoot, render, unmountComponentAtNode } = mocks;

            return { ...mocks, reactDOM: { render, unmountComponentAtNode }, reactDOMClient: { createRoot } };
          }
        ],
        // React 19 has no `ReactDOM.render()`.
        [
          'React 19',
          () => {
            const mocks = createReactDOMMocks();

            return {
              ...mocks,
              reactDOM: { createPortal: jest.fn() },
              reactDOMClient: { createRoot: mocks.createRoot }
            };
          }
        ]
      ])
      .when('a root is created', ({ reactDOM, reactDOMClient, shadowRoot }) =>
        getCreateRoot(reactDOMClient, reactDOM)(shadowRoot)
      )
      .then(
        'should return the root of createRoot() in the shadow root',
        ({ createRoot, root, shadowRoot }, outcome) => {
          expect(outcome).toBe(root);
          expect(createRoot.mock.calls).toEqual([[shadowRoot]]);
        }
      )
      .and('should not call ReactDOM.render()', ({ render }) => expect(render).not.toHaveBeenCalled());
  },
  JestGlobals
);

scenario(
  'getCreateRoot() without "react-dom/client" (React 16 and 17)',
  bdd => {
    bdd
      .given('ReactDOM.render() only', () => createReactDOMMocks())
      .when('a root is created and renders', ({ render, shadowRoot, unmountComponentAtNode }) => {
        const root = getCreateRoot(undefined, { render, unmountComponentAtNode })(shadowRoot);

        root.render('Hello, World!');

        return root;
      })
      .then('should render into the shadow root itself', ({ render, shadowRoot }) =>
        expect(render.mock.calls).toEqual([['Hello, World!', shadowRoot]])
      )
      .when('the root unmounts', (_, root) => root.unmount())
      .then('should unmount the shadow root', ({ shadowRoot, unmountComponentAtNode }) =>
        expect(unmountComponentAtNode.mock.calls).toEqual([[shadowRoot]])
      );
  },
  JestGlobals
);

scenario(
  'getCreateRoot() without a way to render',
  bdd => {
    bdd
      // React 19 without "react-dom/client" in the import map.
      .given('"react-dom" without render() and no "react-dom/client"', () => ({
        reactDOM: { createPortal: jest.fn() }
      }))
      .when('called', ({ reactDOM }) => {
        try {
          getCreateRoot(undefined, reactDOM);
        } catch (error) {
          return error;
        }
      })
      .then('should throw, asking for "react-dom/client" in the import map', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining('map "react-dom/client" too'))
      );

    bdd
      .given('createRoot() that does not return a root', () => ({
        reactDOMClient: { createRoot: () => ({}) },
        shadowRoot: document.createElement('div').attachShadow({ mode: 'open' })
      }))
      .when('a root is created', ({ reactDOMClient, shadowRoot }) => {
        try {
          getCreateRoot(reactDOMClient, undefined)(shadowRoot);
        } catch (error) {
          return error;
        }
      })
      .then('should throw', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining('did not return a root'))
      );
  },
  JestGlobals
);
