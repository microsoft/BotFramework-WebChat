import React, { memo, useMemo, type ReactNode } from 'react';
import { useRefFrom } from 'use-ref-from';
import useActivities from '../../hooks/useActivities';
import usePonyfill from '../../hooks/usePonyfill';
import useUpsertedActivities from '../../providers/ActivityListener/useUpsertedActivities';
import ActivityTypingContext, { ActivityTypingContextType } from './private/Context';
import useMemoWithPrevious from './private/useMemoWithPrevious';
import { type Typing } from './types/Typing';

const INITIAL_ALL_TYPING_STATE = Object.freeze([Object.freeze(new Map())] as const);

function tryParseAsNumber(value: number): number;
function tryParseAsNumber(value: unknown): undefined;

function tryParseAsNumber(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value;
  }
}

type Props = Readonly<{ children?: ReactNode | undefined }>;

const ActivityTypingComposer = ({ children }: Props) => {
  const [{ Date }] = usePonyfill();
  // const [typing, setTyping] = useState<ReadonlyMap<string, Typing>>(Object.freeze(new Map()));

  // // Algorithm 1: just use upsert
  // useActivityUpsertCallback(activities => {
  //   const now = Date.now();
  //   const nextTyping = new Map(typing);
  //   let changed = false;

  //   for (const activity of activities) {
  //     const {
  //       from,
  //       from: { id },
  //       type
  //     } = activity;

  //     if (type === 'typing') {
  //       const currentTyping = nextTyping.get(id);
  //       const currentStreamSequence =
  //         tryParseAsNumber(currentTyping?.lastTypingActivity.channelData.streamSequence) || 0;
  //       const streamSequence = tryParseAsNumber(activity.channelData.streamSequence) || 0;

  //       if (streamSequence >= currentStreamSequence) {
  //         nextTyping.set(id, {
  //           firstTypingActivity: currentTyping?.firstTypingActivity || activity,
  //           firstAppearAt: currentTyping?.firstAppearAt || now,
  //           lastTypingActivity: activity,
  //           lastAppearAt: now,
  //           name: from.name,
  //           role: from.role
  //         });

  //         changed = true;
  //       }
  //     } else if (type === 'message') {
  //       nextTyping.delete(id);
  //       changed = true;
  //     }
  //   }

  //   changed && setTyping(nextTyping);
  // });

  // Algorithm 2: replay at the first activities
  // This algorithm is better because it will not drop any out-of-order activity.
  const [activities] = useActivities();
  const [upsertedActivities] = useUpsertedActivities();
  const activitiesRef = useRefFrom(activities);

  // TODO: We should save this to a Context.
  const allTypingState = useMemoWithPrevious<readonly [ReadonlyMap<string, Typing>]>(
    (prevAllTypingState = INITIAL_ALL_TYPING_STATE) => {
      const { current: activities } = activitiesRef;
      const now = Date.now();
      const nextTyping = new Map(prevAllTypingState[0]);
      let changed = false;

      // Replay from where it started to change to handle OOO properly.
      // For example, we received typing activity IDs: typing-1, typing-3, typing-2.
      // In the output, it should be:
      // - firstTypingActivity: typing-1
      // - lastTypingActivity: typing-3
      const firstIndex = upsertedActivities.reduce(
        (firstIndex, upsertedActivity) => Math.min(firstIndex, activities.indexOf(upsertedActivity)),
        Infinity
      );

      for (const activity of activities.slice(firstIndex)) {
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

          // TODO: Add tests for "streamSequence".
          if (streamSequence >= currentStreamSequence) {
            nextTyping.set(id, {
              firstTypingActivity: currentTyping?.firstTypingActivity || activity,
              firstAppearAt: currentTyping?.firstAppearAt || now,
              lastTypingActivity: activity,
              // Do not update "lastAppearAt" if the last activity is not updated (in OOO cases).
              lastAppearAt: (activity === currentTyping?.lastTypingActivity && currentTyping?.lastAppearAt) || now, // TODO: Add test
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

      return changed ? Object.freeze([nextTyping]) : prevAllTypingState;
    },
    [activities, activitiesRef, upsertedActivities]
  );

  const context = useMemo<ActivityTypingContextType>(() => ({ allTypingState }), [allTypingState]);

  return <ActivityTypingContext.Provider value={context}>{children}</ActivityTypingContext.Provider>;
};

ActivityTypingComposer.displayName = 'ActivityTypingComposer';

export default memo(ActivityTypingComposer);
