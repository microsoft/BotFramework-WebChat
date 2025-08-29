import { useMemoWithPrevious } from '@msinternal/botframework-webchat-react-hooks';
import { type WebChatActivity } from 'botframework-webchat-core';

import { useActivities } from '../../../hooks';

type Entry<T> = Readonly<{
  activity: WebChatActivity;
  value: T | undefined;
}>;

export default function useReduceActivities<T>(
  fn: (prevValue: T, activity: WebChatActivity, index: number, activities: Readonly<WebChatActivity[]>) => T
): T {
  const [activities] = useActivities();

  const state = useMemoWithPrevious<readonly Entry<T>[]>(
    (state = Object.freeze([])) => {
      let changed = activities.length !== state.length;
      let prevValue: T | undefined;
      let shouldRecompute = false;

      const nextState = activities.map<Entry<T>>((activity, index) => {
        const entry = state[+index];

        if (!shouldRecompute && Object.is(entry?.activity, activity)) {
          prevValue = entry?.value;

          // Skips the activity if it has been reduced in the past render loop.
          return entry;
        }

        changed = true;
        shouldRecompute = true;

        return Object.freeze({
          activity,
          value: (prevValue = fn(prevValue, activity, index, activities))
        });
      });

      // Returns the original array if nothing changed.
      return changed ? nextState : state;
    },
    [activities, fn]
  );

  // eslint-disable-next-line no-magic-numbers
  return state.at(-1)?.value;
}
