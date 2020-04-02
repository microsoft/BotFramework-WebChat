import React, { useCallback } from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';
import useDisabled from '../hooks/useDisabled';
import useLocalizer from '../hooks/useLocalizer';
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
  const localize = useLocalizer();
  const submitSendBox = useSubmitSendBox();

  const handleClick = useCallback(() => submitSendBox(), [submitSendBox]);

  return (
    <IconButton alt={localize('TEXT_INPUT_SEND_BUTTON_ALT')} disabled={disabled} onClick={handleClick}>
      <SendIcon />
    </IconButton>
  );
};

export default SendButton;

export { connectSendButton };
