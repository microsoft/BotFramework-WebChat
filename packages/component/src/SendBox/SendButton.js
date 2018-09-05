import { connect } from 'react-redux';
import React from 'react';

import Context from '../Context';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';

// TODO: Change composer.sendMessage into an argument-less function, it will send sendBoxValue
//       It will significantly simplify this part of code
class SendButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { props } = this;
    const { sendBox } = props;

    if (sendBox) {
      props.sendMessage(sendBox);
      props.setSendBox('');
    }
  }

  render() {
    return (
      <IconButton onClick={ this.handleClick }>
        <SendIcon />
      </IconButton>
    );
  }
}

export default connect(({ input: { sendBox } }) => ({ sendBox }))(props =>
  <Context.Consumer>
    { ({ setSendBox, sendMessage }) =>
      <SendButton
        { ...props }
        setSendBox={ setSendBox }
        sendMessage={ sendMessage }
      />
    }
  </Context.Consumer>
)
