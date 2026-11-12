import { type WebChatAPIContextType } from '../WebChatAPIContext';
import createDomainContext from './private/createDomainContext';

/** The setters of the notifications. The notifications are a slice: `useNotificationsSlice()`. */
type NotificationsContextType = {
  readonly dismissNotification: WebChatAPIContextType['dismissNotification'];
  readonly setNotification: WebChatAPIContextType['setNotification'];
};

const [NotificationsContext, useNotificationsContext] =
  createDomainContext<NotificationsContextType>('WebChatNotificationsContext');

export default NotificationsContext;
export { useNotificationsContext, type NotificationsContextType };
