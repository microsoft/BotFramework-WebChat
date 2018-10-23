import React from 'react';

import connectWithContext from '../connectWithContext';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';

const connectSendButton = (...selectors) => connectWithContext(
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
