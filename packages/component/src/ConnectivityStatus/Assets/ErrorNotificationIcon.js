import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React from 'react';
import { number, object, optional, pipe, readonly, string } from 'valibot';

const ICON_SIZE_FACTOR = 16;

const errorNotificationIconPropsSchema = pipe(
  object({
    className: optional(string()),
    size: optional(number())
  }),
  readonly()
);

const ErrorNotificationIcon = props => {
  const { className = '', size = 1 } = validateProps(errorNotificationIconPropsSchema, props);

  return (
    <svg
      alt=""
      className={className}
      height={ICON_SIZE_FACTOR * size}
      viewBox="0 0 13.1 13.1"
      width={ICON_SIZE_FACTOR * size}
    >
      <path
        d="M6.5,13C2.9,13,0,10.1,0,6.5S2.9,0,6.5,0S13,2.9,13,6.5S10.1,13,6.5,13z M6.1,3.5v4.3h0.9V3.5H6.1z M6.1,8.7v0.9h0.9V8.7H6.1z"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default ErrorNotificationIcon;
