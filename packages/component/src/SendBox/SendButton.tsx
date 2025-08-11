import { hooks } from 'botframework-webchat-api';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { useCallback } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { ComponentIcon } from '../Icon';
import useSubmit from '../providers/internal/SendBox/useSubmit';
import IconButton from './IconButton';

const { useDirection, useLocalizer, useUIState } = hooks;

const sendButtonPropsSchema = pipe(
  object({
    className: optional(string())
  }),
  readonly()
);

type SendButtonProps = InferInput<typeof sendButtonPropsSchema>;

function SendButton(props: SendButtonProps) {
  const [direction] = useDirection();
  const { className } = validateProps(sendButtonPropsSchema, props);

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
      <ComponentIcon
        appearance="text"
        className="webchat__send-icon"
        direction={direction === 'rtl' ? 'rtl' : 'follow'}
        icon="send"
      />
    </IconButton>
  );
}

export default SendButton;
export { sendButtonPropsSchema, type SendButtonProps };
