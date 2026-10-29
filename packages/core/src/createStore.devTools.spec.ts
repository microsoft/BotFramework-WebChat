/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { scenario } from '@testduet/given-when-then';
import type { StoreEnhancer } from 'redux';

import setSendBox from './actions/setSendBox';
import { withOptions } from './createStore';

// The global the Redux DevTools browser extension sets.
type WindowWithReduxDevTools = Window & {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: ((enhancer: StoreEnhancer) => StoreEnhancer) | undefined;
};

const devToolsWindow: WindowWithReduxDevTools = window;

scenario('withOptions() with Redux DevTools', bdd => {
  bdd.given
    .oneOf([
      ['devTools: true', () => ({ devTools: true })],
      ['devTools: false', () => ({ devTools: false })]
    ])
    .and(
      'the Redux DevTools browser extension',
      options => {
        const devToolsCreateStore = jest.fn();

        // Same as the extension: wraps the enhancer passed in, here to record the store it creates.
        const composeEnhancers = jest.fn(
          (enhancer: StoreEnhancer): StoreEnhancer =>
            createStore =>
            (...args) => {
              devToolsCreateStore();

              return enhancer(createStore)(...args);
            }
        );

        devToolsWindow.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = composeEnhancers;

        return { composeEnhancers, devToolsCreateStore, options };
      },
      () => {
        delete devToolsWindow.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
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
    .and('the store should be created by the enhancer the extension returned', ({ devToolsCreateStore, options }) =>
      expect(devToolsCreateStore).toHaveBeenCalledTimes(options.devTools ? 1 : 0)
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
