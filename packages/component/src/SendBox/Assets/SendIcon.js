import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React from 'react';

import useStyleToEmotionObject from '../../hooks/internal/useStyleToEmotionObject';

const { useDirection } = hooks;

const ROOT_STYLE = {
  '&.webchat__send-icon': {
    '&.webchat__send-icon--rtl': {
      transform: 'scale(-1, 1)'
    }
  }
};

const SendIcon = () => {
  const [direction] = useDirection();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <svg
      className={classNames('webchat__send-icon', { 'webchat__send-icon--rtl': direction === 'rtl' }, rootClassName)}
      height={28}
      viewBox="0 0 45.7 33.8"
      width={28}
    >
      <path
        clipRule="evenodd"
        d="M8.55 25.25l21.67-7.25H11zm2.41-9.47h19.26l-21.67-7.23zm-6 13l4-11.9L5 5l35.7 11.9z"
      />
    </svg>
  );
};

export default SendIcon;
