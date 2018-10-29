import React from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
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
  ({ submitSendBox }) =>
    <IconButton onClick={ submitSendBox }>
      <SendIcon />
    </IconButton>
)

export { connectSendButton }
