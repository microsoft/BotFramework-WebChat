import { type SendBoxAttachment } from 'botframework-webchat-core';
import { createContext, type Dispatch, type SetStateAction } from 'react';

type SendBoxAttachmentsContextType = Readonly<{
  useSendBoxAttachments: () => readonly [
    readonly SendBoxAttachment[],
    Dispatch<SetStateAction<readonly SendBoxAttachment[]>>
  ];
}>;

const SendBoxAttachmentsContext = createContext<SendBoxAttachmentsContextType>(
  new Proxy({} as SendBoxAttachmentsContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <SendBoxAttachmentsContext>');
    }
  })
);

export default SendBoxAttachmentsContext;
export { type SendBoxAttachmentsContextType };
