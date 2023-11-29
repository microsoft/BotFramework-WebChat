/** @jest-environment jsdom */
/* eslint-disable no-magic-numbers */

import { renderHook } from '@testing-library/react';

import { type ActivityIdToKeyMap } from '../types/ActivityIdToKeyMap';
import { type ActivityKey } from '../../../../../types/ActivityKey';
import { type ActivityToKeyMap } from '../types/ActivityToKeyMap';
import { type ClientActivityIdToKeyMap } from '../types/ClientActivityIdToKeyMap';
import { type KeyToActivitiesMap } from '../types/KeyToActivitiesMap';
import { type WebChatActivity } from 'botframework-webchat-core';
import type UseKeyerType from './useKeyer';

type UseKeyerReturnType = ReturnType<typeof UseKeyerType>;

const ACTIVITIES: readonly WebChatActivity[] = Object.freeze([
  {
    channelData: { clientActivityID: 'cid-0', 'webchat:sequence-id': 0 },
    from: { id: 'bot', role: 'bot' as const },
    id: 'id-0',
    replyToId: 'reply-0',
    text: 'A quick',
    timestamp: '0',
    type: 'typing' as const
  },
  {
    channelData: { clientActivityID: 'cid-1', 'webchat:sequence-id': 1 },
    from: { id: 'bot', role: 'bot' as const },
    id: 'id-1',
    replyToId: 'reply-0',
    text: 'A quick brown fox',
    timestamp: '1',
    type: 'typing' as const
  },
  {
    channelData: { clientActivityID: 'cid-2', 'webchat:sequence-id': 2 },
    from: { id: 'bot', role: 'bot' as const },
    id: 'id-2',
    replyToId: 'reply-0',
    text: 'A quick brown fox jumped over',
    timestamp: '2',
    type: 'typing' as const
  },
  {
    channelData: { clientActivityID: 'cid-3', 'webchat:sequence-id': 3 },
    from: { id: 'bot', role: 'bot' as const },
    id: 'id-3',
    replyToId: 'reply-0',
    text: 'A quick brown fox jumped over the lazy dogs.',
    timestamp: '3',
    type: 'message' as const // This is a "message" and should end the revision.
  },
  {
    channelData: { clientActivityID: 'cid-4', 'webchat:sequence-id': 4 },
    from: { id: 'bot', role: 'bot' as const },
    id: 'id-4',
    replyToId: 'reply-0', // Same replyToId.
    text: 'Hello,',
    timestamp: '4',
    type: 'typing' as const
  },
  {
    channelData: { clientActivityID: 'cid-5', 'webchat:sequence-id': 5 },
    from: { id: 'bot', role: 'bot' as const },
    id: 'id-5',
    replyToId: 'reply-0', // Same replyToId.
    text: 'Hello, World!',
    timestamp: '5',
    type: 'message' as const
  }
]);

afterAll(() => jest.restoreAllMocks());
beforeAll(() =>
  jest.mock('./uniqueId', () => {
    let index = 0;

    return () => 'key-' + index++;
  })
);

describe('simple typing scenario', () => {
  let activityIdToKeyMap: Readonly<ActivityIdToKeyMap>;
  let activityKeySet: ReadonlySet<ActivityKey>;
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
    } = renderHook((): UseKeyerReturnType => useKeyer(ACTIVITIES)));
  });

  test('"activityIdToKeyMap" should work', () => {
    expect(activityIdToKeyMap).toHaveProperty('size', 6);
    expect(activityIdToKeyMap.get('id-0')).toBe('wc.a.key-0');
    expect(activityIdToKeyMap.get('id-1')).toBe('wc.a.key-0');
    expect(activityIdToKeyMap.get('id-2')).toBe('wc.a.key-0');
    expect(activityIdToKeyMap.get('id-3')).toBe('wc.a.key-0');
    expect(activityIdToKeyMap.get('id-4')).toBe('wc.a.key-1');
    expect(activityIdToKeyMap.get('id-5')).toBe('wc.a.key-1');
  });

  test('"activityKeySet" should work', () => expect(Array.from(activityKeySet)).toEqual(['wc.a.key-0', 'wc.a.key-1']));

  test('"activityToKeyMap" should work', () => {
    expect(activityToKeyMap).toHaveProperty('size', 6);
    expect(activityToKeyMap.get(ACTIVITIES[0])).toBe('wc.a.key-0');
    expect(activityToKeyMap.get(ACTIVITIES[1])).toBe('wc.a.key-0');
    expect(activityToKeyMap.get(ACTIVITIES[2])).toBe('wc.a.key-0');
    expect(activityToKeyMap.get(ACTIVITIES[3])).toBe('wc.a.key-0');
    expect(activityToKeyMap.get(ACTIVITIES[4])).toBe('wc.a.key-1');
    expect(activityToKeyMap.get(ACTIVITIES[5])).toBe('wc.a.key-1');
  });

  test('"clientActivityIdToKeyMap" should work', () => {
    expect(clientActivityIdToKeyMap).toHaveProperty('size', 6);
    expect(clientActivityIdToKeyMap.get('cid-0')).toBe('wc.a.key-0');
    expect(clientActivityIdToKeyMap.get('cid-1')).toBe('wc.a.key-0');
    expect(clientActivityIdToKeyMap.get('cid-2')).toBe('wc.a.key-0');
    expect(clientActivityIdToKeyMap.get('cid-3')).toBe('wc.a.key-0');
    expect(clientActivityIdToKeyMap.get('cid-4')).toBe('wc.a.key-1');
    expect(clientActivityIdToKeyMap.get('cid-5')).toBe('wc.a.key-1');
  });

  test('"keyToActivitiesMap" should work', () => {
    expect(keyToActivitiesMap).toHaveProperty('size', 2);
    expect(keyToActivitiesMap.get('wc.a.key-0')).toEqual(ACTIVITIES.slice(0, 4));
    expect(keyToActivitiesMap.get('wc.a.key-1')).toEqual(ACTIVITIES.slice(4));
  });
});
