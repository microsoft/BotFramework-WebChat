import React from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import { localize } from '../Localization/Localize';
import SendIcon from './Assets/SendIcon';

const connectSendButton = (...selectors) => connectToWebChat(
  ({
    language,
    sendBoxValue,
    setSendBox,
    submitSendBox
  }) => ({
    click: () => {
      setSendBox(sendBoxValue.trim());
      submitSendBox();
    },
    language
  }),
  ...selectors
)

export default connectSendButton()(
  ({ click, language }) =>
    <div>
      <IconButton
        alt={ localize('Send', language) }
        onClick={ click }
      >
        <SendIcon />
      </IconButton>
    </div>
)

export { connectSendButton }
