import PropTypes from 'prop-types';
import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';

const connectSendButton = (...selectors) =>
  connectToWebChat(
    ({ disabled, language, submitSendBox }) => ({
      disabled,
      language,
      submitSendBox
    }),
    ...selectors
  );

const SendButton = ({ disabled, language, submitSendBox }) => (
  <IconButton alt={localize('Send', language)} disabled={disabled} onClick={submitSendBox}>
    <SendIcon />
  </IconButton>
);

SendButton.defaultProps = {
  disabled: false
};

SendButton.propTypes = {
  disabled: PropTypes.bool,
  language: PropTypes.string.isRequired,
  submitSendBox: PropTypes.func.isRequired
};

export default connectSendButton()(SendButton);

export { connectSendButton };
