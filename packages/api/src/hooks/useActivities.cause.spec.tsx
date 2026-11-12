/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { createStore, type WebChatActivity } from 'botframework-webchat-core';
import { type ReactNode } from 'react';

const incoming = (id: string, text: string = id) => ({
  payload: {
    activity: { channelData: {}, from: { id: 'bot', role: 'bot' }, id, text, type: 'message' }
  },
  type: 'DIRECT_LINE/INCOMING_ACTIVITY'
});

// Renders useActivities() with the graph mocked, so the test decides what the graph returns.
function renderActivities({ graphIsEmpty = false }: { readonly graphIsEmpty?: boolean } = {}) {
  let modules: {
    readonly React: typeof import('react');
    readonly render: typeof import('@testing-library/react/pure').render;
    readonly useActivities: typeof import('./useActivities').default;
    readonly WebChatReduxProvider: typeof import('./internal/WebChatReduxProvider').default;
  };

  const store = createStore();

  store.dispatch(incoming('a-1'));
  store.dispatch(incoming('a-2'));

  const graph: { activities: readonly WebChatActivity[] } = {
    activities: graphIsEmpty ? Object.freeze([]) : store.getState().activities
  };

  jest.isolateModules(() => {
    jest.doMock('@msinternal/botframework-webchat-api-graph', () => ({
      useOrderedActivities: () => Object.freeze([graph.activities])
    }));

    modules = {
      React: require('react'),
      render: require('@testing-library/react/pure').render,
      useActivities: require('./useActivities').default,
      WebChatReduxProvider: require('./internal/WebChatReduxProvider').default
    };
  });

  const { React, render, useActivities, WebChatReduxProvider } = modules;
  const errors: unknown[] = [];
  // React 16 in development also rethrows the error caught by the error boundary.
  const catchError = (fn: () => void) => {
    try {
      fn();
    } catch (error) {
      errors.includes(error) || errors.push(error);
    }
  };

  class ErrorBoundary extends React.Component<{ readonly children?: ReactNode }, { readonly error: unknown }> {
    constructor(props: { readonly children?: ReactNode }) {
      super(props);

      this.state = { error: undefined };
    }

    static getDerivedStateFromError(error: unknown) {
      errors.includes(error) || errors.push(error);

      return { error };
    }

    render() {
      const { children } = this.props;
      const { error } = this.state;

      return error ? null : children;
    }
  }

  function Activities() {
    useActivities();

    return null;
  }

  let unmount: () => void;

  catchError(() => {
    ({ unmount } = render(
      <ErrorBoundary>
        <WebChatReduxProvider store={store}>
          <Activities />
        </WebChatReduxProvider>
      </ErrorBoundary>
    ));
  });

  return {
    dispatch: (action: ReturnType<typeof incoming>) => catchError(() => store.dispatch(action)),
    errors,
    graph,
    store,
    unmount: () => unmount?.()
  };
}

describe('useActivities() when graph and Redux differ', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    // React logs errors caught by error boundaries.
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => consoleError.mockRestore());

  test('should throw with everything as added, on the first render', () => {
    const { errors, store, unmount } = renderActivities({ graphIsEmpty: true });
    const [activity1, activity2] = store.getState().activities;

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('cause', {
      activitiesFromGraph: { added: [], changed: [], deleted: [], everything: [] },
      activitiesFromRedux: {
        added: [activity1, activity2],
        changed: [],
        deleted: [],
        everything: [activity1, activity2]
      }
    });

    unmount();
  });

  test('should throw with what was added and deleted on each side, when sizes differ', () => {
    const { dispatch, errors, graph, store, unmount } = renderActivities();
    const [activity1, activity2] = store.getState().activities;

    expect(errors).toEqual([]);

    // Graph loses "a-1" while Redux receives "a-3".
    graph.activities = Object.freeze([activity2]);
    dispatch(incoming('a-3'));

    const [, , activity3] = store.getState().activities;

    expect(activity3).toHaveProperty('id', 'a-3');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty(
      'message',
      'botframework-webchat-internal: Activities from graph and Redux are of different size (graph has 1 activities, Redux has 3 activities)'
    );
    expect(errors[0]).toHaveProperty('cause', {
      activitiesFromGraph: { added: [], changed: [], deleted: [activity1], everything: [activity2] },
      activitiesFromRedux: {
        added: [activity3],
        changed: [],
        deleted: [],
        everything: [activity1, activity2, activity3]
      }
    });

    unmount();
  });

  test('should throw with what was changed on each side, when an activity differs', () => {
    const { dispatch, errors, store, unmount } = renderActivities();
    const [activity1, activity2] = store.getState().activities;

    // Redux replaces "a-2" (same local ID), the graph keeps the old one.
    dispatch(incoming('a-2', 'updated'));

    const [, nextActivity2] = store.getState().activities;

    expect(nextActivity2).toHaveProperty('text', 'updated');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty(
      'message',
      'botframework-webchat-internal: Activities from graph and Redux are different at index 1'
    );
    expect(errors[0]).toHaveProperty('cause', {
      activitiesFromGraph: { added: [], changed: [], deleted: [], everything: [activity1, activity2] },
      activitiesFromRedux: { added: [], changed: [nextActivity2], deleted: [], everything: [activity1, nextActivity2] },
      index: 1
    });

    unmount();
  });
});
