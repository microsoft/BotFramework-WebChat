import React from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import { localize } from '../Localization/Localize';
import SendIcon from './Assets/SendIcon';

const connectSendButton = (...selectors) => connectToWebChat(
  ({
    language,
    submitSendBox
  }) => ({
    click: submitSendBox,
    language
  }),
  ...selectors
)

export default connectSendButton()(
  ({ click, language }) =>
    <IconButton
      alt={ localize('Send', language) }
      onClick={ click }
    >
      <SendIcon />
    </IconButton>
)

export { connectSendButton }
