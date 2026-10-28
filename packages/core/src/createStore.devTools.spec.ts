/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { scenario } from '@testduet/given-when-then';
import type { StoreEnhancer } from 'redux';

import setSendBox from './actions/setSendBox';
import { withOptions } from './createStore';

scenario('withOptions() with Redux DevTools', bdd => {
  bdd.given
    .oneOf([
      ['devTools: true', () => ({ devTools: true })],
      ['devTools: false', () => ({ devTools: false })]
    ])
    .and(
      'the Redux DevTools browser extension',
      options => {
        // Same as the extension: composes its own enhancer with the one passed in.
        const composeEnhancers = jest.fn((enhancer: StoreEnhancer) => enhancer);

        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = composeEnhancers;

        return { composeEnhancers, options };
      },
      () => {
        delete window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
      }
    )
    .when('a store is created and an action is dispatched', ({ options }) => {
      const store = withOptions(options);

      store.dispatch(setSendBox('Hello, World!'));

      return store;
    })
    .then('the extension should be called only with devTools: true', ({ composeEnhancers, options }) =>
      expect(composeEnhancers.mock.calls).toEqual(options.devTools ? [[expect.any(Function)]] : [])
    )
    .and('the store should work', (_, store) =>
      expect(store.getState()).toHaveProperty('sendBoxValue', 'Hello, World!')
    );

  bdd
    .given('devTools: true without the Redux DevTools browser extension', () => ({ devTools: true }))
    .when('a store is created and an action is dispatched', options => {
      const store = withOptions(options);

      store.dispatch(setSendBox('Hello, World!'));

      return store;
    })
    .then('the store should work', (_, store) =>
      expect(store.getState()).toHaveProperty('sendBoxValue', 'Hello, World!')
    );
});
