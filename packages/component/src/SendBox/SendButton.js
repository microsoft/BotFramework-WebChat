import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';
import useLocalize from '../hooks/useLocalize';

const connectSendButton = (...selectors) =>
  connectToWebChat(
    ({ disabled, language, submitSendBox }) => ({
      disabled,
      language,
      submitSendBox
    }),
    ...selectors
  );

const SendButton = ({ disabled, submitSendBox }) => {
  const altText = useLocalize('Send');

  return (
    <IconButton alt={altText} disabled={disabled} onClick={submitSendBox}>
      <SendIcon />
    </IconButton>
  );
};

SendButton.defaultProps = {
  disabled: false
};

SendButton.propTypes = {
  disabled: PropTypes.bool,
  submitSendBox: PropTypes.func.isRequired
};

export default connectSendButton()(SendButton);

export { connectSendButton };
