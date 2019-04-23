import React from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import { localize } from '../Localization/Localize';
import SendIcon from './Assets/SendIcon';

const connectSendButton = (...selectors) => connectToWebChat(
  ({
    disabled,
    focusSendBox,
    language,
    sendBoxValue,
    setSendBox,
    submitSendBox
  }) => ({
    click: () => {
      setSendBox(sendBoxValue.trim());
      submitSendBox();
      focusSendBox();
    },
    disabled,
    language
  }),
  ...selectors
)

export default connectSendButton()(
  ({ click, disabled, language }) =>
    <div>
      <IconButton
        alt={ localize('Send', language) }
        disabled={ disabled }
        onClick={ click }
      >
        <SendIcon />
      </IconButton>
    </div>
)

export { connectSendButton }
