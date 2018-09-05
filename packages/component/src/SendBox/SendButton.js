import { connect } from 'react-redux';
import React from 'react';

import Context from '../Context';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';

export default connect(({ input: { sendBox } }) => ({ sendBox }))(props =>
  <Context.Consumer>
    { ({ submitSendBox }) =>
      <IconButton onClick={ submitSendBox }>
        <SendIcon />
      </IconButton>
    }
  </Context.Consumer>
)
