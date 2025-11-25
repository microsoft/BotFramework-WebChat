import type sendBoxAttachments from '../../reducers/sendBoxAttachments';
import type { State } from '../../reducers/activities/sort/types';
import type { WebChatActivity } from '../WebChatActivity';
import type { Notification } from './Notification';

// TODO: Should build this using typings of createReducer.
type ReduxState = {
  activities: WebChatActivity[];
  clockSkewAdjustment: number;
  dictateState: string;
  groupedActivities: State;
  language: string;
  notifications: { [key: string]: Notification };
  sendBoxAttachments: ReturnType<typeof sendBoxAttachments>;
  sendBoxValue: string;
  sendTimeout: number;
  sendTypingIndicator: boolean;
  shouldSpeakIncomingActivity: boolean;
};

export type { ReduxState };
