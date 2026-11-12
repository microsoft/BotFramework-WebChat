import { useSelector } from '@msinternal/botframework-webchat-redux-store';

import { type Notification } from '../types/Notification';

const selectNotifications = ({ notifications }) => notifications;

export default function useNotifications(): [Notification[]] {
  return [useSelector(selectNotifications)];
}
