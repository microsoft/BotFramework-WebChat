/* eslint no-case-declarations: "off" */
/* eslint no-unused-vars: "off" */

import updateIn from 'simple-update-in';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { POST_ACTIVITY_PENDING } from '../actions/postActivity';

import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { IncomingActivityAction } from '../actions/incomingActivity';
import type { PostActivityPendingAction } from '../actions/postActivity';
import type { Reducer } from 'redux';

type TypingState = Record<
  string,
  {
    at: number;
    last: number;
    name: string;
    role: 'bot' | 'channel' | 'user';
  }
>;
type TypingAction = IncomingActivityAction | PostActivityPendingAction;

const DEFAULT_STATE: TypingState = {};

export default function createLastTypingReducer({ Date }: GlobalScopePonyfill): Reducer<TypingState, TypingAction> {
  return function lastTyping(state: TypingState = DEFAULT_STATE, { payload, type }: TypingAction): TypingState {
    if (type === INCOMING_ACTIVITY || type === POST_ACTIVITY_PENDING) {
      const {
        activity: {
          from: { id, name, role },
          type: activityType
        }
      } = payload;

      if (activityType === 'typing') {
        const now = Date.now();

        state = updateIn(state, [id, 'at'], at => at || now);
        state = updateIn(state, [id, 'last'], () => now);
        state = updateIn(state, [id, 'name'], () => name);
        state = updateIn(state, [id, 'role'], () => role);
      } else if (activityType === 'message') {
        state = updateIn(state, [id]);
      }
    }

    return state;
  };
}
