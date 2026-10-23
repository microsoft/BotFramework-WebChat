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

scenario(
  'createKeyedSubscription with an unsubscribe called twice',
  bdd => {
    bdd
      .given('a listener of "a" unsubscribed, then a new listener of "a"', () => {
        const { notify, subscribe } = createKeyedSubscription<string>();
        const prevListener = JestGlobals.jest.fn();
        const unsubscribePrev = subscribe('a', prevListener);

        unsubscribePrev();

        const nextListener = JestGlobals.jest.fn();

        subscribe('a', nextListener);

        return { nextListener, notify, prevListener, unsubscribePrev };
      })
      .when('the first unsubscribe is called again and "a" is notified', ({ notify, unsubscribePrev }) => {
        unsubscribePrev();
        notify(['a']);
      })
      .then('the new listener should still be called', ({ nextListener, prevListener }) => {
        expect(nextListener).toHaveBeenCalledTimes(1);
        expect(prevListener).not.toHaveBeenCalled();
      });
  },
  JestGlobals
);
