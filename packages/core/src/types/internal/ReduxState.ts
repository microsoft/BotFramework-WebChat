import type { DirectLineActivity } from '../external/DirectLineActivity';
import type { Notification } from './Notification';

type ReduxState = {
  activities: DirectLineActivity[];
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
