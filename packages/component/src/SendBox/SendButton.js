import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';
import useDisabled from '../hooks/useDisabled';
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

const SendButton = ({ submitSendBox }) => {
  const [disabled] = useDisabled();
  const altText = useLocalize('Send');

  return (
    <IconButton alt={altText} disabled={disabled} onClick={submitSendBox}>
      <SendIcon />
    </IconButton>
  );
};

SendButton.propTypes = {
  submitSendBox: PropTypes.func.isRequired
};

export default connectSendButton()(SendButton);

export { connectSendButton };
