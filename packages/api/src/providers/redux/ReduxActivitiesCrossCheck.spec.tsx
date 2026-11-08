/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { createStore } from 'botframework-webchat-core';
import { type ReactNode } from 'react';

type Store = ReturnType<typeof createStore>;

const incoming = (id: string) => ({
  payload: {
    activity: { channelData: {}, from: { id: 'bot', role: 'bot' }, id, text: id, type: 'message' }
  },
  type: 'DIRECT_LINE/INCOMING_ACTIVITY'
});

// Each test loads its own React: after an error thrown while rendering, React 16 under happy-dom does not render again.
function load() {
  let modules: {
    readonly act: typeof import('@testing-library/react/pure').act;
    readonly GraphProvider: typeof import('@msinternal/botframework-webchat-api-graph').GraphProvider;
    readonly React: typeof import('react');
    readonly ReduxActivitiesCrossCheck: typeof import('./ReduxActivitiesCrossCheck').default;
    readonly render: typeof import('@testing-library/react/pure').render;
    readonly WebChatReduxProvider: typeof import('../../hooks/internal/WebChatReduxProvider').default;
  };

  jest.isolateModules(() => {
    const { act, render } = require('@testing-library/react/pure');

    modules = {
      act,
      GraphProvider: require('@msinternal/botframework-webchat-api-graph').GraphProvider,
      React: require('react'),
      ReduxActivitiesCrossCheck: require('./ReduxActivitiesCrossCheck').default,
      render,
      WebChatReduxProvider: require('../../hooks/internal/WebChatReduxProvider').default
    };
  });

  return modules;
}

// Redux and the graph can read different stores here, to make them disagree.
function renderCrossCheck({ graphStore, reduxStore }: { readonly graphStore: Store; readonly reduxStore: Store }) {
  const { act, GraphProvider, React, ReduxActivitiesCrossCheck, render, WebChatReduxProvider } = load();
  const errors: Error[] = [];

  class ErrorBoundary extends React.Component<{ readonly children?: ReactNode }, { readonly error: unknown }> {
    constructor(props: { readonly children?: ReactNode }) {
      super(props);

      this.state = { error: undefined };
    }

    static getDerivedStateFromError(error: Error) {
      errors.includes(error) || errors.push(error);

      return { error };
    }

    render() {
      const { children } = this.props;
      const { error } = this.state;

      return error ? null : children;
    }
  }

  const renderTree = ({ graphStore, reduxStore }: { readonly graphStore: Store; readonly reduxStore: Store }) => (
    <ErrorBoundary>
      <WebChatReduxProvider store={reduxStore}>
        <GraphProvider store={graphStore}>
          <ReduxActivitiesCrossCheck />
        </GraphProvider>
      </WebChatReduxProvider>
    </ErrorBoundary>
  );

  const result = render(renderTree({ graphStore, reduxStore }));

  return {
    // React 16 in development also rethrows the error caught by the error boundary to the code that caused the render.
    act: (fn: () => void) => {
      try {
        act(fn);
      } catch (error) {
        errors.includes(error) || errors.push(error);
      }
    },
    errors,
    rerender: (stores: { readonly graphStore: Store; readonly reduxStore: Store }) =>
      result.rerender(renderTree(stores)),
    unmount: () => result.unmount()
  };
}

describe('<ReduxActivitiesCrossCheck>', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    // React logs errors caught by error boundaries.
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => consoleError.mockRestore());

  test('should not throw while the graph and Redux agree', () => {
    const store = createStore();
    const { act, errors, unmount } = renderCrossCheck({ graphStore: store, reduxStore: store });

    act(() => {
      store.dispatch(incoming('a-1'));
      store.dispatch(incoming('a-2'));
    });

    store.dispatch(incoming('a-3'));

    expect(errors).toEqual([]);
    expect(store.getState().activities).toHaveLength(3);

    unmount();
  });

  test('should throw when the graph and Redux disagree', () => {
    const graphStore = createStore();
    const reduxStore = createStore();
    const { act, errors, unmount } = renderCrossCheck({ graphStore, reduxStore });

    act(() => reduxStore.dispatch(incoming('a-1')));

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(
      'botframework-webchat-internal: Activities from graph and Redux are of different size (graph has 0 activities, Redux has 1 activities)'
    );

    unmount();
  });

  test('should throw when the activities differ at an index', () => {
    const graphStore = createStore();
    const reduxStore = createStore();
    const { act, errors, unmount } = renderCrossCheck({ graphStore, reduxStore });

    // Same size, different objects.
    act(() => {
      graphStore.dispatch(incoming('a-1'));
      reduxStore.dispatch(incoming('a-1'));
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(
      'botframework-webchat-internal: Activities from graph and Redux are different at index 0'
    );

    unmount();
  });

  test('should skip one check after the store is swapped, while the graph catches up', () => {
    const store1 = createStore();
    const store2 = createStore();

    store1.dispatch(incoming('a-1'));
    store2.dispatch(incoming('b-1'));
    store2.dispatch(incoming('b-2'));

    const { errors, rerender, unmount } = renderCrossCheck({ graphStore: store1, reduxStore: store1 });

    rerender({ graphStore: store2, reduxStore: store2 });
    store2.dispatch(incoming('b-3'));

    expect(errors).toEqual([]);

    unmount();
  });
});
