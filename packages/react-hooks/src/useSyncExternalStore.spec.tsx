/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import type { ReactElement, ReactNode } from 'react';

type Subscribe = (onStoreChange: () => void) => () => void;

type ReaderProps = { readonly getSnapshot: () => number; readonly subscribe: Subscribe };

type Environment = {
  readonly act: (fn: () => void) => void;
  // Classic JSX runtime: JSX below uses this `React`, the React under test.
  readonly React: typeof import('react');
  readonly render: (element: ReactElement) => { rerender(element: ReactElement): void; unmount(): void };
  readonly useSyncExternalStore: typeof import('./useSyncExternalStore').default;
};

// React 16.8.6 of the repository, with the fallback.
function loadReact16(): Environment {
  let environment!: Environment;

  jest.isolateModules(() => {
    const { act } = jest.requireActual<typeof import('react-dom/test-utils')>('react-dom/test-utils');
    const ReactDOM = jest.requireActual<typeof import('react-dom')>('react-dom');

    environment = {
      act,
      React: jest.requireActual('react'),
      render: element => {
        const container = document.createElement('div');

        act(() => {
          ReactDOM.render(element, container);
        });

        return {
          rerender: element =>
            act(() => {
              ReactDOM.render(element, container);
            }),
          unmount: () =>
            act(() => {
              ReactDOM.unmountComponentAtNode(container);
            })
        };
      },
      useSyncExternalStore:
        jest.requireActual<typeof import('./useSyncExternalStore')>('./useSyncExternalStore').default
    };
  });

  return environment;
}

// React 18.3.1 installed for the repack of "react-dom" (the repository pins React 16.8.6), with `useSyncExternalStore()` of React.
function loadReact18(): Environment {
  let environment!: Environment;

  jest.isolateModules(() => {
    // The same copy of React as React DOM 18 requires: the only React 18 in the repository, the root pins React 16.8.6.
    const React = jest.requireActual<typeof import('react')>('../../repack/react-dom/node_modules/react');

    // Fails loudly if a change of npm hoisting moves this copy, instead of testing another version of React.
    if (!React.version.startsWith('18.')) {
      throw new Error(`Expected React 18 in packages/repack/react-dom/node_modules, found ${React.version}.`);
    }

    jest.doMock('react', () => React);

    const { act } = jest.requireActual<typeof import('react-dom/test-utils')>(
      '../../repack/react-dom/node_modules/react-dom/test-utils'
    );
    const { createRoot } = jest.requireActual<{
      createRoot(container: Element): { render(element: ReactElement): void; unmount(): void };
    }>('../../repack/react-dom/node_modules/react-dom/client');

    environment = {
      act,
      React,
      render: element => {
        const root = createRoot(document.createElement('div'));

        act(() => root.render(element));

        return {
          rerender: element => act(() => root.render(element)),
          unmount: () => act(() => root.unmount())
        };
      },
      // Its import of "react" gets the mock above.
      useSyncExternalStore:
        jest.requireActual<typeof import('./useSyncExternalStore')>('./useSyncExternalStore').default
    };
  });

  return environment;
}

function createStore(initialValue: number) {
  const listeners = new Set<() => void>();
  let value = initialValue;

  return {
    getSnapshot: () => value,
    listeners,
    set(nextValue: number) {
      value = nextValue;
      listeners.forEach(listener => listener());
    },
    subscribe: jest.fn((listener: () => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    })
  };
}

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  jest.dontMock('react');
  jest.restoreAllMocks();
});

describe.each([
  ['React 16 (fallback)', loadReact16],
  ['React 18 (built-in)', loadReact18]
])('useSyncExternalStore() on %s', (_, load) => {
  let environment: Environment;

  beforeEach(() => {
    environment = load();
  });

  function renderReader(props: ReaderProps) {
    const { React, render, useSyncExternalStore } = environment;
    const renders: number[] = [];

    function Reader({ getSnapshot, subscribe }: ReaderProps) {
      renders.push(useSyncExternalStore(subscribe, getSnapshot));

      return null;
    }

    const { rerender, unmount } = render(<Reader {...props} />);

    return {
      renders,
      rerender: (props: ReaderProps) => rerender(<Reader {...props} />),
      unmount
    };
  }

  test('should render the snapshot, and render again only when it changes', () => {
    const store = createStore(0);
    const { renders } = renderReader({ getSnapshot: store.getSnapshot, subscribe: store.subscribe });

    environment.act(() => store.set(1));
    environment.act(() => store.set(1)); // Notifies with the same snapshot.

    expect(renders).toEqual([0, 1]);
  });

  test('should render again for a change between render and subscription', () => {
    const { act, React, render, useSyncExternalStore } = environment;
    const store = createStore(0);
    const renders: number[] = [];

    // Before the reader: its layout effect runs after the reader rendered, before it subscribes.
    function SetOnMount() {
      React.useLayoutEffect(() => store.set(1), []);

      return null;
    }

    function Reader() {
      renders.push(useSyncExternalStore(store.subscribe, store.getSnapshot));

      return null;
    }

    render(
      <React.Fragment>
        <SetOnMount />
        <Reader />
      </React.Fragment>
    );

    expect(renders).toEqual([0, 1]);

    act(() => store.set(2));

    expect(renders).toEqual([0, 1, 2]);
  });

  test('should subscribe again when "subscribe" changes, not when "getSnapshot" changes', () => {
    const store = createStore(0);
    const otherStore = createStore(10);
    const { renders, rerender, unmount } = renderReader({ getSnapshot: store.getSnapshot, subscribe: store.subscribe });

    rerender({ getSnapshot: () => store.getSnapshot() + 100, subscribe: store.subscribe });

    expect(renders).toEqual([0, 100]);
    expect(store.subscribe).toHaveBeenCalledTimes(1);

    rerender({ getSnapshot: otherStore.getSnapshot, subscribe: otherStore.subscribe });

    expect(renders).toEqual([0, 100, 10]);
    expect(store.listeners.size).toBe(0);
    expect(otherStore.listeners.size).toBe(1);

    unmount();

    expect(otherStore.listeners.size).toBe(0);
  });

  test('should subscribe once under <StrictMode>, and unsubscribe after unmount', () => {
    const { React, render, useSyncExternalStore } = environment;
    const store = createStore(0);

    function Reader() {
      useSyncExternalStore(store.subscribe, store.getSnapshot);

      return null;
    }

    const { unmount } = render(
      <React.StrictMode>
        <Reader />
      </React.StrictMode>
    );

    expect(store.listeners.size).toBe(1);

    unmount();

    expect(store.listeners.size).toBe(0);
  });

  test('should throw the error from "getSnapshot" while rendering', () => {
    const { act, React, render, useSyncExternalStore } = environment;
    const artificialError = new Error('Artificial error.');
    const errors: unknown[] = [];
    const store = createStore(0);

    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    class ErrorBoundary extends React.Component<{ readonly children?: ReactNode }, { readonly error: unknown }> {
      constructor(props: { readonly children?: ReactNode }) {
        super(props);

        this.state = { error: undefined };
      }

      static getDerivedStateFromError(error: unknown) {
        errors.includes(error) || errors.push(error);

        return { error };
      }

      override render() {
        const { children } = this.props;
        const { error } = this.state;

        return error ? null : children;
      }
    }

    function Reader() {
      useSyncExternalStore(store.subscribe, () => {
        if (store.getSnapshot() === 1) {
          throw artificialError;
        }

        return store.getSnapshot();
      });

      return null;
    }

    render(
      <ErrorBoundary>
        <Reader />
      </ErrorBoundary>
    );

    try {
      act(() => store.set(1));
    } catch (error) {
      // React 16 in development rethrows the error to the code that caused the render, before the error boundary gets it.
      errors.includes(error) || errors.push(error);
    }

    // React 18 renders again after an error, which throws the same error.
    expect(errors).toEqual([artificialError]);
  });
});

describe('useSyncExternalStore() on React 18', () => {
  test('should render a change from outside of React in a microtask, as the built-in hook does', async () => {
    const { React, render, useSyncExternalStore } = loadReact18();
    const renders: number[] = [];
    const store = createStore(0);

    function Reader() {
      renders.push(useSyncExternalStore(store.subscribe, store.getSnapshot));

      return null;
    }

    render(<Reader />);

    // Outside of act(), like a message from the chat adapter.
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;
    store.set(1);

    expect(renders).toEqual([0]);

    // Sync lane: React renders in a microtask queued by the change; `useState()` would render in a later task.
    await Promise.resolve();

    expect(renders).toEqual([0, 1]);
  });
});
