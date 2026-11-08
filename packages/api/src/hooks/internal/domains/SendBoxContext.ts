import { type SendBoxAttachment } from 'botframework-webchat-core';

import { type WebChatAPIContextType } from '../WebChatAPIContext';
import { type Source } from './Source';
import createDomainContext from './private/createDomainContext';

type SendBoxContextType = {
  readonly attachments: Source<readonly SendBoxAttachment[]>;
  readonly emitTypingIndicator: WebChatAPIContextType['emitTypingIndicator'];
  readonly sendTypingIndicator: Source<boolean>;
  readonly setAttachments: WebChatAPIContextType['setSendBoxAttachments'];
  readonly setValue: WebChatAPIContextType['setSendBox'];
  readonly submit: WebChatAPIContextType['submitSendBox'];
  readonly value: Source<string>;
};

const [SendBoxContext, useSendBoxContext] = createDomainContext<SendBoxContextType>('WebChatSendBoxContext');

export default SendBoxContext;
export { useSendBoxContext, type SendBoxContextType };
