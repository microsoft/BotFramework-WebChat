import { type Notification } from '../../../types/Notification';
import { type WebChatAPIContextType } from '../WebChatAPIContext';
import { type Source } from './Source';
import createDomainContext from './private/createDomainContext';

type NotificationsContextType = {
  readonly dismissNotification: WebChatAPIContextType['dismissNotification'];
  readonly notifications: Source<Notification[]>;
  readonly setNotification: WebChatAPIContextType['setNotification'];
};

const [NotificationsContext, useNotificationsContext] =
  createDomainContext<NotificationsContextType>('WebChatNotificationsContext');

export default NotificationsContext;
export { useNotificationsContext, type NotificationsContextType };
