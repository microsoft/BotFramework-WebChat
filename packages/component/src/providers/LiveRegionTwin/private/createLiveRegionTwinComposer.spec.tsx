/** @jest-environment @happy-dom/jest-environment */

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import React, { createRef, useEffect } from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

import useQueueStaticElement from '../useQueueStaticElement';
import LiveRegionTwinComposer from './LiveRegionTwinComposer';

// Timers are fired by the test, so a timer can fire after an element is queued and before it is rendered.
const mockTimers = new Map<number, () => void>();

jest.mock('botframework-webchat-api', () => {
  let nextTimeoutId = 1;

  const ponyfill = Object.freeze({
    clearTimeout: (timeoutId: number) => mockTimers.delete(timeoutId),
    setTimeout: (fn: () => void) => {
      const timeoutId = nextTimeoutId++;

      mockTimers.set(timeoutId, fn);

      return timeoutId;
    }
  });

  return { hooks: { usePonyfill: () => [ponyfill] } };
});

function fireAllTimers() {
  const fns = Array.from(mockTimers.values());

  mockTimers.clear();
  fns.forEach(fn => fn());
}

type QueueStaticElement = ReturnType<typeof useQueueStaticElement>;

function QueueStaticElementRef({
  queueStaticElementRef
}: {
  readonly queueStaticElementRef: { current?: QueueStaticElement };
}) {
  const queueStaticElement = useQueueStaticElement();

  useEffect(() => {
    queueStaticElementRef.current = queueStaticElement;
  }, [queueStaticElement, queueStaticElementRef]);

  return null;
}

scenario(
  'LiveRegionTwinComposer',
  bdd => {
    bdd
      .given('a live region', () => {
        const container = document.createElement('div');
        const queueStaticElementRef: { current?: QueueStaticElement } = {};

        mockTimers.clear();

        act(() => {
          render(
            <LiveRegionTwinComposer ariaNotifyTargetRef={createRef()} fadeAfter={1000}>
              <QueueStaticElementRef queueStaticElementRef={queueStaticElementRef} />
            </LiveRegionTwinComposer>,
            container
          );
        });

        return { container, queueStaticElementRef };
      })
      .when('"Hello" is queued', ({ queueStaticElementRef }) => {
        act(() => queueStaticElementRef.current('Hello'));
      })
      .then('the live region should have "Hello" and a fade out timer', ({ container }) => {
        expect(container.textContent).toBe('Hello');
        expect(mockTimers.size).toBe(1);
      })
      .when('"World" is queued and the timer fires before "World" is rendered', ({ queueStaticElementRef }) => {
        act(() => {
          queueStaticElementRef.current('World');
          fireAllTimers();
        });
      })
      .then('the live region should have "World" only', ({ container }) => expect(container.textContent).toBe('World'))
      .when('the timer fires again', () => {
        act(() => fireAllTimers());
      })
      .then('the live region should be empty', ({ container }) => {
        expect(container.textContent).toBe('');
        expect(mockTimers.size).toBe(0);
      });
  },
  JestGlobals
);
