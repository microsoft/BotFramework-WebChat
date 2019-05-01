import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
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
    <IconButton
      alt={ localize('Send', language) }
      disabled={ disabled }
      onClick={ click }
    >
      <SendIcon />
    </IconButton>
)

export { connectSendButton }
