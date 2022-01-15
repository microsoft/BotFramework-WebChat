import { useMemo, useRef } from 'react';
import { useSticky } from 'react-scroll-to-bottom';

import findLastIndex from '../../Utils/findLastIndex';
import useChanged from './useChanged';
import useGetActivityByKey from '../../providers/ActivityKeyer/useGetActivityByKey';
import useOrderedActivityKeys from '../../providers/ActivityTree/useOrderedActivityKeys';

// Acknowledged means either:
// 1. The user sent a message
//    - We don't need a condition here. When Web Chat sends the user's message, it will scroll to bottom, and it will trigger condition 2 below.
// 2. The user scroll to the bottom of the transcript, from a non-bottom scroll position
//    - If the transcript is already at the bottom, the user needs to scroll up and then go back down
//    - What happens if we are relaxing "scrolled from a non-bottom scroll position":
//      1. The condition will become solely "at the bottom of the transcript"
//      2. Auto-scroll will always scroll the transcript to the bottom
//      3. Web Chat will always acknowledge all activities as it is at the bottom
//      4. Acknowledge flag become useless
//      5. Therefore, even the developer set "pause after 3 activities", if activities are coming in at a slow pace (not batched in a single render)
//         Web Chat will keep scrolling and not snapped/paused

// Note: When Web Chat is loaded, there are no activities acknowledged. We need to assume all arriving activities are acknowledged until end-user sends their first activity.
//       Activities loaded initially could be from conversation history. Without assuming acknowledgement, Web Chat will not scroll initially (as everything is not acknowledged).
//       It would be better if the chat adapter should let Web Chat know if the activity is loaded from history or not.

// TODO: [P2] #3670 Move the "conversation history acknowledgement" logic mentioned above to polyfill of chat adapters.
//       1. Chat adapter should send "acknowledged" as part of "channelData"
//       2. If "acknowledged" is "undefined", we set it to:
//          a. true, if there are no egress activities yet
//          b. Otherwise, false
export default function useAcknowledgedActivityKey(): readonly [string] {
  const [orderedActivityKeys] = useOrderedActivityKeys();
  const [sticky]: [boolean] = useSticky();
  const getActivityByKey = useGetActivityByKey();
  const lastStickyActivityKeyRef = useRef<string>();

  const stickyChanged = useChanged(sticky);
  const stickyChangedToSticky = stickyChanged && sticky;

  const lastStickyActivityKey = useMemo(() => {
    if (stickyChangedToSticky) {
      lastStickyActivityKeyRef.current = orderedActivityKeys[orderedActivityKeys.length - 1];
    }

    return lastStickyActivityKeyRef.current;
  }, [orderedActivityKeys, lastStickyActivityKeyRef, stickyChangedToSticky]);

  return useMemo<readonly [string]>(() => {
    const lastStickyActivityIndex = orderedActivityKeys.indexOf(lastStickyActivityKey);
    const lastEgressActivityIndex = findLastIndex(
      orderedActivityKeys,
      key => getActivityByKey(key)?.from?.role === 'user'
    );

    // As described above, if no activities were acknowledged through egress activity, we will assume everything is acknowledged.
    const lastAcknowledgedActivityIndex = !~lastEgressActivityIndex
      ? orderedActivityKeys.length - 1
      : Math.max(lastStickyActivityIndex, lastEgressActivityIndex);

    return Object.freeze([orderedActivityKeys[+lastAcknowledgedActivityIndex]]) as readonly [string];
  }, [getActivityByKey, lastStickyActivityKey, orderedActivityKeys]);
}
