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

type Action = ReturnType<typeof deleteActivity> | ReturnType<typeof incoming>;
type StoreMode = 'default' | 'redux';

// Each test loads its own React: after an error thrown while rendering, React 16 under happy-dom does not render again.
function renderActivities(mode: StoreMode) {
  let modules: {
    readonly act: typeof import('@testing-library/react/pure').act;
    readonly createActivitiesStore: typeof import('botframework-webchat-core/internal.js').createActivitiesStore;
    readonly DefaultProviders: typeof import('../providers/default/DefaultProviders').default;
    readonly GraphProvider: typeof import('@msinternal/botframework-webchat-api-graph').GraphProvider;
    readonly PonyfillComposer: typeof import('../providers/Ponyfill/PonyfillComposer').default;
    readonly React: typeof import('react');
    readonly ReduxActivitiesCrossCheck: typeof import('../providers/redux/ReduxActivitiesCrossCheck').default;
    readonly render: typeof import('@testing-library/react/pure').render;
    readonly useActivities: typeof import('./useActivities').default;
    readonly WebChatReduxProvider: typeof import('./internal/WebChatReduxProvider').default;
  };

  jest.isolateModules(() => {
    const { act, render } = require('@testing-library/react/pure');

    modules = {
      act,
      createActivitiesStore: require('botframework-webchat-core/internal.js').createActivitiesStore,
      DefaultProviders: require('../providers/default/DefaultProviders').default,
      GraphProvider: require('@msinternal/botframework-webchat-api-graph').GraphProvider,
      PonyfillComposer: require('../providers/Ponyfill/PonyfillComposer').default,
      React: require('react'),
      ReduxActivitiesCrossCheck: require('../providers/redux/ReduxActivitiesCrossCheck').default,
      render,
      useActivities: require('./useActivities').default,
      WebChatReduxProvider: require('./internal/WebChatReduxProvider').default
    };
  });

  const {
    act,
    createActivitiesStore,
    DefaultProviders,
    GraphProvider,
    PonyfillComposer,
    React,
    ReduxActivitiesCrossCheck,
    render,
    useActivities,
    WebChatReduxProvider
  } = modules;
  const errors: unknown[] = [];
  const renders: (readonly string[])[] = [];

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
    const [activities] = useActivities();

    renders.push(activities.map(({ id }) => id));

    return null;
  }

  let apply: (action: Action) => void;
  let unmount: () => void;

  if (mode === 'redux') {
    const store = createStore();

    apply = action => store.dispatch(action);

    // As <ReduxProviders> in development: <ReduxActivitiesCrossCheck> throws if the activities of the graph and Redux
    // differ (the check that useActivities() did before), and it renders before the children.
    ({ unmount } = render(
      <ErrorBoundary>
        <WebChatReduxProvider store={store}>
          <GraphProvider store={store}>
            <ReduxActivitiesCrossCheck />
            <Activities />
          </GraphProvider>
        </WebChatReduxProvider>
      </ErrorBoundary>
    ));
  } else {
    // eslint-disable-next-line no-restricted-globals
    const activitiesStore = createActivitiesStore({ ponyfill: { Date } });

    // The operations of the activities store for the same actions, as the default providers run them.
    apply = ({ payload, type }) =>
      type === 'DIRECT_LINE/DELETE_ACTIVITY'
        ? activitiesStore.deleteActivity((payload as ReturnType<typeof deleteActivity>['payload']).activityID)
        : activitiesStore.receiveActivity((payload as ReturnType<typeof incoming>['payload']).activity as any);

    ({ unmount } = render(
      <ErrorBoundary>
        <PonyfillComposer>
          <DefaultProviders activitiesStore={activitiesStore}>
            <Activities />
          </DefaultProviders>
        </PonyfillComposer>
      </ErrorBoundary>
    ));
  }

  act(() => {
    apply(incoming('a-1'));
    apply(incoming('a-2'));
  });

  return {
    // React 16 in development also rethrows the error caught by the error boundary to the code that caused the render.
    dispatch: (action: Action, { batch }: { readonly batch: boolean }) => {
      try {
        // Inside act(), React batches the re-renders of every store listener.
        batch
          ? act(() => {
              apply(action);
            })
          : apply(action);
      } catch (error) {
        errors.includes(error) || errors.push(error);
      }
    },
    errors,
    renders,
    unmount
  };
}

describe.each(['redux', 'default'] as const)('useActivities() after DIRECT_LINE/DELETE_ACTIVITY in %s mode', mode => {
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
    const { dispatch, errors, renders, unmount } = renderActivities(mode);

    expect(renders.at(-1)).toEqual(['a-1', 'a-2']);

    dispatch(deleteActivity('a-1'), { batch: true });

    expect(errors).toEqual([]);
    expect(renders.at(-1)).toEqual(['a-2']);

    unmount();
  });

  test('should return the activities without the deleted one, outside of a batch', () => {
    const { dispatch, errors, renders, unmount } = renderActivities(mode);

    // Outside of act(): React 16 re-renders on every store listener, unless the listener batches the updates.
    dispatch(deleteActivity('a-1'), { batch: false });

    expect(errors).toEqual([]);
    expect(renders.at(-1)).toEqual(['a-2']);

    unmount();
  });

  test('should return a new activity, outside of a batch', () => {
    const { dispatch, errors, renders, unmount } = renderActivities(mode);

    dispatch(incoming('a-3'), { batch: false });

    expect(errors).toEqual([]);
    expect(renders.at(-1)).toEqual(['a-1', 'a-2', 'a-3']);

    unmount();
  });
});
