import type sendBoxAttachments from '../../reducers/sendBoxAttachments';
import type { WebChatActivity } from '../WebChatActivity';
import type { Notification } from './Notification';

// TODO: Should build this using typings of createReducer.
type ReduxState = {
  activities: WebChatActivity[];
  clockSkewAdjustment: number;
  dictateState: string;
  language: string;
  notifications: { [key: string]: Notification };
  sendBoxAttachments: ReturnType<typeof sendBoxAttachments>;
  sendBoxValue: string;
  sendTimeout: number;
  sendTypingIndicator: boolean;
  shouldSpeakIncomingActivity: boolean;
  enableStreaming: boolean;
};

export type { ReduxState };
