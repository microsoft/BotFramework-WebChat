import { type WebChatAPIContextType } from '../WebChatAPIContext';
import createDomainContext from './private/createDomainContext';

/** The setters of the send box. Its value, attachments and typing indicator are slices: `SendBoxSlices`. */
type SendBoxContextType = {
  readonly emitTypingIndicator: WebChatAPIContextType['emitTypingIndicator'];
  readonly setAttachments: WebChatAPIContextType['setSendBoxAttachments'];
  readonly setValue: WebChatAPIContextType['setSendBox'];
  readonly submit: WebChatAPIContextType['submitSendBox'];
};

const [SendBoxContext, useSendBoxContext] = createDomainContext<SendBoxContextType>('WebChatSendBoxContext');

export default SendBoxContext;
export { useSendBoxContext, type SendBoxContextType };
