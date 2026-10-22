import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';

import createKeyedSubscription from './createKeyedSubscription';

scenario(
  'createKeyedSubscription',
  bdd => {
    bdd
      .given('listeners subscribed to "a" and "b"', () => {
        const { notify, subscribe } = createKeyedSubscription<string>();
        const listenerA = JestGlobals.jest.fn();
        const listenerB = JestGlobals.jest.fn();

        return {
          listenerA,
          listenerB,
          notify,
          unsubscribeA: subscribe('a', listenerA),
          unsubscribeB: subscribe('b', listenerB)
        };
      })
      .when('"a" is notified twice in one call', ({ notify }) => notify(['a', 'a']))
      .then('only the listener of "a" should be called, once', ({ listenerA, listenerB }) => {
        expect(listenerA).toHaveBeenCalledTimes(1);
        expect(listenerB).not.toHaveBeenCalled();
      })
      .when('the listener of "a" unsubscribes and both keys are notified', ({ notify, unsubscribeA }) => {
        unsubscribeA();
        notify(['a', 'b']);
      })
      .then('only the listener of "b" should be called', ({ listenerA, listenerB }) => {
        expect(listenerA).toHaveBeenCalledTimes(1); // From the first notification.
        expect(listenerB).toHaveBeenCalledTimes(1);
      });
  },
  JestGlobals
);
