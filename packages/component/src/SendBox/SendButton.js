import React from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import { localize } from '../Localization/Localize';
import SendIcon from './Assets/SendIcon';

const connectSendButton = (...selectors) => connectToWebChat(
  ({
    language,
    direction,
    submitSendBox
  }) => ({
    click: submitSendBox,
    language,
    direction
  }),
  ...selectors
)

export default connectSendButton()(
  ({ click, language, direction }) =>
    <IconButton
      alt={ localize('Send', language) }
      onClick={ click }
      direction={ direction }
    >
      <SendIcon />
    </IconButton>
)

export { connectSendButton }
