import { type SendBoxAttachment } from 'botframework-webchat-core';
import React, { type ReactNode } from 'react';

import createSliceContext from './private/createSliceContext';

const [SendBoxAttachmentsContext, useSendBoxAttachmentsSlice] = createSliceContext<readonly SendBoxAttachment[]>(
  'WebChatSendBoxAttachmentsContext'
);

const [SendBoxValueContext, useSendBoxValueSlice] = createSliceContext<string>('WebChatSendBoxValueContext');

const [SendTypingIndicatorContext, useSendTypingIndicatorSlice] = createSliceContext<boolean>(
  'WebChatSendTypingIndicatorContext'
);

type SendBoxSlicesProps = {
  readonly children?: ReactNode | undefined;
  readonly sendBoxAttachments: readonly SendBoxAttachment[];
  readonly sendBoxValue: string;
  readonly sendTypingIndicator: boolean;
};

/**
 * The slices of the send box group: attachments, value and send typing indicator, one context each, so a hook
 * re-renders only when its slice changes. Both provider sets render it, with the values of their state.
 */
function SendBoxSlicesProvider({
  children,
  sendBoxAttachments,
  sendBoxValue,
  sendTypingIndicator
}: SendBoxSlicesProps) {
  return (
    <SendBoxAttachmentsContext.Provider value={sendBoxAttachments}>
      <SendBoxValueContext.Provider value={sendBoxValue}>
        <SendTypingIndicatorContext.Provider value={sendTypingIndicator}>
          {children}
        </SendTypingIndicatorContext.Provider>
      </SendBoxValueContext.Provider>
    </SendBoxAttachmentsContext.Provider>
  );
}

SendBoxSlicesProvider.displayName = 'SendBoxSlicesProvider';

// Not memoized: its children are the next slices, a new element on every render of the parent.
export default SendBoxSlicesProvider;
export { useSendBoxAttachmentsSlice, useSendBoxValueSlice, useSendTypingIndicatorSlice, type SendBoxSlicesProps };
