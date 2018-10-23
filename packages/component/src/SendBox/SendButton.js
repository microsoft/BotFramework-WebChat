import React from 'react';

import connectWithContext from '../connectWithContext';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';

const connectSendButton = (...selectors) => connectWithContext(
  ({ submitSendBox }) => ({ submitSendBox }),
  ...selectors
)

export default connectSendButton()(
  ({ submitSendBox }) =>
    <IconButton onClick={ submitSendBox }>
      <SendIcon />
    </IconButton>
)

export { connectSendButton }
