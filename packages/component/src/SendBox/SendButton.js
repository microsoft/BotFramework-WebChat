import React from 'react';

import connectWithContext from '../connectWithContext';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';

export default connectWithContext(
  ({ submitSendBox }) => ({ submitSendBox })
)(
  ({ submitSendBox }) =>
    <IconButton onClick={ submitSendBox }>
      <SendIcon />
    </IconButton>
)
