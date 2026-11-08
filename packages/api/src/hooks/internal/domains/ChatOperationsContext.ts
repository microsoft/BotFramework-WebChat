import { type WebChatAPIContextType } from '../WebChatAPIContext';
import createDomainContext from './private/createDomainContext';

/**
 * Chat operations that are not part of another domain. Only `<Composer>` reads it, to fill `WebChatAPIContext` and to
 * pass `dispatch` to card action middleware.
 */
type ChatOperationsContextType = {
  readonly clearSuggestedActions: WebChatAPIContextType['clearSuggestedActions'];
  /** The `dispatch` given to card action middleware. */
  readonly dispatch: (action: unknown) => unknown;
  readonly markActivity: WebChatAPIContextType['markActivity'];
  readonly postActivity: WebChatAPIContextType['postActivity'];
  readonly sendEvent: WebChatAPIContextType['sendEvent'];
  readonly sendFiles: WebChatAPIContextType['sendFiles'];
  readonly sendMessage: WebChatAPIContextType['sendMessage'];
  readonly sendMessageBack: WebChatAPIContextType['sendMessageBack'];
  readonly sendPostBack: WebChatAPIContextType['sendPostBack'];
  readonly setSendTimeout: WebChatAPIContextType['setSendTimeout'];
};

const [ChatOperationsContext, useChatOperationsContext] =
  createDomainContext<ChatOperationsContextType>('WebChatChatOperationsContext');

export default ChatOperationsContext;
export { useChatOperationsContext, type ChatOperationsContextType };
