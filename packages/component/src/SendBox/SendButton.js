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
    const { sendBoxValue } = props;

    if (sendBoxValue) {
      props.sendMessage(sendBoxValue);
      props.onSendBoxChange('');
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

export default props =>
  <Context.Consumer>
    { ({ onSendBoxChange, sendBoxValue, sendMessage }) =>
      <SendButton
        onSendBoxChange={ onSendBoxChange }
        sendBoxValue={ sendBoxValue }
        sendMessage={ sendMessage }
      />
    }
  </Context.Consumer>
