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
      height={16}
      viewBox="0 0 14 14"
      width={16}
    >
      <path
        clipRule="evenodd"
        d="M0.176834 0.118496C0.329527 -0.0108545 0.544637 -0.0367025 0.723627 0.0527924L13.7236 6.55279C13.893 6.63748 14 6.81061 14 7C14 7.18939 13.893 7.36252 13.7236 7.44721L0.723627 13.9472C0.544637 14.0367 0.329527 14.0109 0.176834 13.8815C0.0241407 13.7522 -0.0367196 13.5442 0.0221319 13.353L1.97688 7L0.0221319 0.647048C-0.0367196 0.455781 0.0241407 0.247847 0.176834 0.118496ZM2.8693 7.5L1.32155 12.5302L12.382 7L1.32155 1.46979L2.8693 6.5H8.50001C8.77615 6.5 9.00001 6.72386 9.00001 7C9.00001 7.27614 8.77615 7.5 8.50001 7.5H2.8693Z"
      />
    </svg>
  );
};

export default SendIcon;
