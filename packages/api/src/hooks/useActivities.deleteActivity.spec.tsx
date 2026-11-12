/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { createStore } from 'botframework-webchat-core';
import { type ReactNode } from 'react';

const incoming = (id: string) => ({
  payload: {
    activity: { channelData: {}, from: { id: 'bot', role: 'bot' }, id, text: id, type: 'message' }
  },
  type: 'DIRECT_LINE/INCOMING_ACTIVITY'
});

const deleteActivity = (activityID: string) => ({ payload: { activityID }, type: 'DIRECT_LINE/DELETE_ACTIVITY' });

// Each test loads its own React: after an error thrown while rendering, React 16 under happy-dom does not render again.
function renderActivities() {
  let modules: {
    readonly act: typeof import('@testing-library/react/pure').act;
    readonly React: typeof import('react');
    readonly ReduxStoreProvider: typeof import('./internal/ReduxStoreProvider').default;
    readonly render: typeof import('@testing-library/react/pure').render;
    readonly useActivities: typeof import('./useActivities').default;
    readonly WebChatReduxProvider: typeof import('./internal/WebChatReduxProvider').default;
  };

  jest.isolateModules(() => {
    const { act, render } = require('@testing-library/react/pure');

    modules = {
      act,
      React: require('react'),
      ReduxStoreProvider: require('./internal/ReduxStoreProvider').default,
      render,
      useActivities: require('./useActivities').default,
      WebChatReduxProvider: require('./internal/WebChatReduxProvider').default
    };
  });

  const { act, React, ReduxStoreProvider, render, useActivities, WebChatReduxProvider } = modules;
  const errors: unknown[] = [];
  const renders: (readonly string[])[] = [];
  const store = createStore();

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
    // In development, useActivities() throws if the activities of the graph and Redux differ.
    const [activities] = useActivities();

    renders.push(activities.map(({ id }) => id));

    return null;
  }

  const { unmount } = render(
    <ErrorBoundary>
      <WebChatReduxProvider store={store}>
        <ReduxStoreProvider>
          <Activities />
        </ReduxStoreProvider>
      </WebChatReduxProvider>
    </ErrorBoundary>
  );

  act(() => {
    store.dispatch(incoming('a-1'));
    store.dispatch(incoming('a-2'));
  });

  return {
    // React 16 in development also rethrows the error caught by the error boundary to the code that caused the render.
    dispatch: (
      action: ReturnType<typeof deleteActivity> | ReturnType<typeof incoming>,
      { batch }: { readonly batch: boolean }
    ) => {
      try {
        // Inside act(), React batches the re-renders of every store listener.
        batch
          ? act(() => {
              store.dispatch(action);
            })
          : store.dispatch(action);
      } catch (error) {
        errors.includes(error) || errors.push(error);
      }
    },
    errors,
    renders,
    unmount
  };
}

describe('useActivities() after DIRECT_LINE/DELETE_ACTIVITY', () => {
  let consoleError: jest.SpyInstance;
  let consoleWarn: jest.SpyInstance;

  beforeEach(() => {
    // React logs errors caught by error boundaries.
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    // The reducer warns that DELETE_ACTIVITY is deprecated.
    consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });

  test('should return the activities without the deleted one, in a batch', () => {
    const { dispatch, errors, renders, unmount } = renderActivities();

    expect(renders.at(-1)).toEqual(['a-1', 'a-2']);

    dispatch(deleteActivity('a-1'), { batch: true });

    expect(errors).toEqual([]);
    expect(renders.at(-1)).toEqual(['a-2']);

    unmount();
  });

  test('should return the activities without the deleted one, outside of a batch', () => {
    const { dispatch, errors, renders, unmount } = renderActivities();

    // Outside of act(): React 16 re-renders on every store listener, unless the listener batches the updates.
    dispatch(deleteActivity('a-1'), { batch: false });

    expect(errors).toEqual([]);
    expect(renders.at(-1)).toEqual(['a-2']);

    unmount();
  });

  test('should return a new activity, outside of a batch', () => {
    const { dispatch, errors, renders, unmount } = renderActivities();

    dispatch(incoming('a-3'), { batch: false });

    expect(errors).toEqual([]);
    expect(renders.at(-1)).toEqual(['a-1', 'a-2', 'a-3']);

    unmount();
  });
});
