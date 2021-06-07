import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { FC, useCallback } from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';
import useFocus from '../hooks/useFocus';
import useScrollToEnd from '../hooks/useScrollToEnd';

const { useDisabled, useLocalizer, useSubmitSendBox } = hooks;

const connectSendButton = (...selectors) =>
  connectToWebChat(
    ({ disabled, language, submitSendBox }) => ({
      disabled,
      language,
      submitSendBox
    }),
    ...selectors
  );

type SendButtonProps = {
  className?: string;
};

const SendButton: FC<SendButtonProps> = ({ className }) => {
  const [disabled] = useDisabled();
  const focus = useFocus();
  const localize = useLocalizer();
  const scrollToEnd = useScrollToEnd();
  const submitSendBox = useSubmitSendBox();

  const handleClick = useCallback(() => {
    focus('sendBoxWithoutKeyboard');
    scrollToEnd();
    submitSendBox();
  }, [focus, scrollToEnd, submitSendBox]);

  return (
    <IconButton
      alt={localize('TEXT_INPUT_SEND_BUTTON_ALT')}
      className={classNames('webchat__send-button', className)}
      disabled={disabled}
      onClick={handleClick}
    >
      <SendIcon />
    </IconButton>
  );
};

SendButton.defaultProps = {
  className: undefined
};

SendButton.propTypes = {
  className: PropTypes.string
};

export default SendButton;

export { connectSendButton };
