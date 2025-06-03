import { type SendBoxAttachment } from 'botframework-webchat-core';
import { createContext, type Dispatch, type SetStateAction } from 'react';

type SendBoxContextType = Readonly<{
  useSendBoxAttachments: () => readonly [
    readonly SendBoxAttachment[],
    Dispatch<SetStateAction<readonly SendBoxAttachment[]>>
  ];
  useSendBoxValue: () => readonly [string, Dispatch<SetStateAction<string>>];
}>;

const SendBoxContext = createContext<SendBoxContextType>(
  new Proxy({} as SendBoxContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <SendBoxContext>');
    }
  })
);

export default SendBoxContext;
export { type SendBoxContextType };
