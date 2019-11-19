import React from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';
import useDisabled from '../hooks/useDisabled';
import useLocalize from '../hooks/useLocalize';
import useSubmitSendBox from '../hooks/useSubmitSendBox';

const connectSendButton = (...selectors) =>
  connectToWebChat(
    ({ disabled, language, submitSendBox }) => ({
      disabled,
      language,
      submitSendBox
    }),
    ...selectors
  );

const SendButton = () => {
  const [disabled] = useDisabled();
  const altText = useLocalize('Send');
  const submitSendBox = useSubmitSendBox();

  return (
    <IconButton alt={altText} disabled={disabled} onClick={submitSendBox}>
      <SendIcon />
    </IconButton>
  );
};

export default SendButton;

export { connectSendButton };
