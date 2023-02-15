import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import SendIcon from './Assets/SendIcon';
import useSubmit from '../providers/internal/SendBox/useSubmit';

import type { FC } from 'react';

const { useDisabled, useLocalizer } = hooks;

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
  const localize = useLocalizer();
  const submit = useSubmit();

  const handleClick = useCallback(() => submit({ setFocus: 'sendBoxWithoutKeyboard' }), [submit]);

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
