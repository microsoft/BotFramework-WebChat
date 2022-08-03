import type { Notification } from './Notification';
import type { WebChatActivity } from '../WebChatActivity';

type ReduxState = {
  activities: WebChatActivity[];
  clockSkewAdjustment: number;
  dictateState: string;
  language: string;
  notifications: { [key: string]: Notification };
  sendBoxValue: string;
  sendTimeout: number;
  sendTypingIndicator: boolean;
  shouldSpeakIncomingActivity: boolean;
};

export type { ReduxState };
