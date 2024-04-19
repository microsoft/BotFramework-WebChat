import type { WebChatActivity } from 'botframework-webchat-core';
import { useMemo, useState } from 'react';
import useActivityUpsertCallback from '../../providers/ActivityListener/useActivityUpsertCallback';
import usePonyfill from '../usePonyfill';

type Typing = {
  firstAppearAt: number;
  firstTypingActivity: Readonly<WebChatActivity & { type: 'typing' }>;
  lastAppearAt: number;
  lastTypingActivity: Readonly<WebChatActivity & { type: 'typing' }>;
  name: string;
  role: string;
};

function tryParseAsNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value;
  }
}

export default function useAllTyping(): readonly [ReadonlyMap<string, Typing>] {
  const [{ Date }] = usePonyfill();
  const [typing, setTyping] = useState<ReadonlyMap<string, Typing>>(Object.freeze(new Map()));

  // Algorithm 1: just use upsert
  useActivityUpsertCallback(activities => {
    const now = Date.now();
    const nextTyping = new Map(typing);
    let changed = false;

    for (const activity of activities) {
      const {
        from,
        from: { id },
        type
      } = activity;

      if (type === 'typing') {
        const currentTyping = nextTyping.get(id);
        const currentStreamSequence =
          tryParseAsNumber(currentTyping?.lastTypingActivity.channelData.streamSequence) || 0;
        const streamSequence = tryParseAsNumber(activity.channelData.streamSequence) || 0;

        if (streamSequence >= currentStreamSequence) {
          nextTyping.set(id, {
            firstTypingActivity: currentTyping?.firstTypingActivity || activity,
            firstAppearAt: currentTyping?.firstAppearAt || now,
            lastTypingActivity: activity,
            lastAppearAt: now,
            name: from.name,
            role: from.role
          });

          changed = true;
        }
      } else if (type === 'message') {
        nextTyping.delete(id);
        changed = true;
      }
    }

    changed && setTyping(nextTyping);
  });

  // // Algorithm 2: replay at the first activities
  // // This algorithm is better because it will not drop any out-of-order activity.
  // const [activities] = useActivities();

  // useActivityUpsertCallback(upsertedActivities => {
  //   const firstIndex = upsertedActivities.reduce(
  //     (index, upsertedActivity) => Math.min(index, activities.indexOf(upsertedActivity)),
  //     Infinity
  //   );

  //   // Replay all "message" and "typing" activities.
  //   // When OOO happens, "typing" activity could be ignored in algorithm 1.
  //   // But in algorithm 2, the OOO "typing" activity is not ignored but replayed at the correct position.
  //   // The benefit is we will not lose any "typing" activity in case they are OOO.
  //   for (const activity of activities.slice(firstIndex)) {
  //     console.log(activity);
  //   }
  // });

  return useMemo(() => Object.freeze([typing]), [typing]);
}
