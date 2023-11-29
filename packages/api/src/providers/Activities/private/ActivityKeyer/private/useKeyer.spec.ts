/** @jest-environment jsdom */

import { renderHook } from '@testing-library/react';

import { type ActivityIdToKeyMap } from '../types/ActivityIdToKeyMap';
import { type ActivityToKeyMap } from '../types/ActivityToKeyMap';
import { type ClientActivityIdToKeyMap } from '../types/ClientActivityIdToKeyMap';
import { type KeyToActivitiesMap } from '../types/KeyToActivitiesMap';
import { type WebChatActivity } from 'botframework-webchat-core';
import type useKeyerType from './useKeyer';

type UseKeyerReturnType = ReturnType<typeof useKeyerType>;

const ACTIVITY: WebChatActivity = {
  channelData: { clientActivityID: 'cid-0', 'webchat:sequence-id': 0 },
  from: { id: 'bot', role: 'bot' as const },
  id: 'id-0',
  text: 'Hello, World!',
  timestamp: '0',
  type: 'message' as const
};

afterAll(() => jest.restoreAllMocks());
beforeAll(() =>
  jest.mock('./uniqueId', () => {
    let index = 0;

    return () => 'key-' + index++;
  })
);

describe('simple scenario', () => {
  let activityIdToKeyMap: Readonly<ActivityIdToKeyMap>;
  let activityKeySet: ReadonlySet<string>;
  let activityToKeyMap: Readonly<ActivityToKeyMap>;
  let clientActivityIdToKeyMap: Readonly<ClientActivityIdToKeyMap>;
  let keyToActivitiesMap: Readonly<KeyToActivitiesMap>;

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: useKeyer } = require('./useKeyer');

    ({
      result: {
        current: { activityIdToKeyMap, activityKeySet, activityToKeyMap, clientActivityIdToKeyMap, keyToActivitiesMap }
      }
    } = renderHook((): UseKeyerReturnType => useKeyer([ACTIVITY])));
  });

  test('"activityIdToKeyMap" should work', () => {
    expect(activityIdToKeyMap).toHaveProperty('size', 1);
    expect(activityIdToKeyMap.get('id-0')).toBe('wc.a.key-0');
  });

  test('"activityKeySet" should work', () => expect(Array.from(activityKeySet)).toEqual(['wc.a.key-0']));

  test('"activityToKeyMap" should work', () => {
    expect(activityToKeyMap).toHaveProperty('size', 1);
    expect(activityToKeyMap.get(ACTIVITY)).toBe('wc.a.key-0');
  });

  test('"clientActivityIdToKeyMap" should work', () => {
    expect(clientActivityIdToKeyMap).toHaveProperty('size', 1);
    expect(clientActivityIdToKeyMap.get('cid-0')).toBe('wc.a.key-0');
  });

  test('"keyToActivitiesMap" should work', () => {
    expect(keyToActivitiesMap).toHaveProperty('size', 1);
    expect(keyToActivitiesMap.get('wc.a.key-0')).toEqual([ACTIVITY]);
  });
});
