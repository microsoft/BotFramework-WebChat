import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { useCallback } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import parseProps from '../Utils/parseProps';
import useSubmit from '../providers/internal/SendBox/useSubmit';
import SendIcon from './Assets/SendIcon';
import IconButton from './IconButton';

const { useLocalizer, useUIState } = hooks;

const sendButtonPropsSchema = pipe(
  object({
    className: optional(string())
  }),
  readonly()
);

type SendButtonProps = InferInput<typeof sendButtonPropsSchema>;

function SendButton(props: SendButtonProps) {
  const { className } = parseProps(sendButtonPropsSchema, props);

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
}

export default SendButton;
export { sendButtonPropsSchema, type SendButtonProps };
