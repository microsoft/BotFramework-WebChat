import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import useSubmit from '../providers/internal/SendBox/useSubmit';
import SendIcon from './Assets/SendIcon';
import IconButton from './IconButton';

const { useLocalizer, useUIState } = hooks;

type SendButtonProps = Readonly<{
  className?: string;
}>;

const SendButton = ({ className }: SendButtonProps) => {
  const [uiState] = useUIState();
  const localize = useLocalizer();
  const submit = useSubmit();

  const handleClick = useCallback(() => submit({ setFocus: 'sendBoxWithoutKeyboard' }), [submit]);

  return (
    <IconButton
      alt={localize('TEXT_INPUT_SEND_BUTTON_ALT')}
      className={classNames('webchat__send-button', className)}
      disabled={uiState === 'disabled'}
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
