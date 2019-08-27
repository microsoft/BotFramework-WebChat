import React, { useMemo } from 'react';

import { useLocalize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';
import useWebChat from '../useWebChat';

const connectSendButton = (...selectors) => {
  console.warn(
    'Web Chat: connectSendButton() will be removed on or after 2021-09-27, please use useSendButton() instead.'
  );

  return connectToWebChat(
    ({ disabled, language, submitSendBox }) => ({
      disabled,
      language,
      submitSendBox
    }),
    ...selectors
  );
};

const useSendButton = () => {
  const { disabled, submitSendBox } = useWebChat(state => state);

  return useMemo(
    () => ({
      disabled,
      submitSendBox
    }),
    [disabled, submitSendBox]
  );
};

const SendButton = () => {
  const { disabled, submitSendBox } = useSendButton();
  const buttonAltText = useLocalize('Send');

  return (
    <IconButton alt={buttonAltText} disabled={disabled} onClick={submitSendBox}>
      <SendIcon />
    </IconButton>
  );
};

export default SendButton;

export { connectSendButton, useSendButton };
