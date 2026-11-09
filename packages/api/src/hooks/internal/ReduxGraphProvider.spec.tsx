/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { render } from '@testing-library/react';
import { scenario } from '@testduet/given-when-then';
import { createStore } from 'botframework-webchat-core';
import React, { Fragment, StrictMode } from 'react';

import useActivities from '../useActivities';
import ReduxGraphProvider from './ReduxGraphProvider';
import WebChatReduxProvider from './WebChatReduxProvider';

function Activities() {
  useActivities();

  return null;
}

scenario(
  '<ReduxGraphProvider>',
  bdd => {
    bdd.given
      .oneOf([
        ['without <StrictMode>', () => ({ Wrapper: Fragment })],
        ['with <StrictMode>', () => ({ Wrapper: StrictMode })]
      ])
      .and('a store which counts its subscriptions', ({ Wrapper }) => {
        const store = createStore();
        const { subscribe } = store;
        const subscriptions = new Set<() => void>();

        store.subscribe = listener => {
          const unsubscribe = subscribe(listener);
          const subscription = () => {
            subscriptions.delete(subscription);
            unsubscribe();
          };

          subscriptions.add(subscription);

          return subscription;
        };

        return { store, subscriptions, Wrapper };
      })
      .when('rendered with a component using useActivities()', ({ store, Wrapper }) =>
        render(
          <Wrapper>
            <WebChatReduxProvider store={store}>
              <ReduxGraphProvider>
                <Activities />
              </ReduxGraphProvider>
            </WebChatReduxProvider>
          </Wrapper>
        )
      )
      // The batched subscription of useSelector() serves the graph, <GraphProvider> and useActivities().
      .then('should subscribe to the store once', ({ subscriptions }) => expect(subscriptions.size).toBe(1))
      .when('unmounted', (_, { unmount }) => unmount())
      .then('should unsubscribe from the store', ({ subscriptions }) => expect(subscriptions.size).toBe(0));
  },
  JestGlobals
);
