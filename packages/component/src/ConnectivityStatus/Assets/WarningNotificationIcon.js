import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React from 'react';
import { nullish, number, object, pipe, readonly, string } from 'valibot';

const { useDirection } = hooks;

const ICON_SIZE_FACTOR = 16;

const warningNotificationIconPropsSchema = pipe(
  object({
    className: nullish(string()),
    size: nullish(number())
  }),
  readonly()
);

const WarningNotificationIcon = props => {
  const { className = '', size = 1 } = validateProps(warningNotificationIconPropsSchema, props);

  const [direction] = useDirection();

  return (
    <svg
      alt=""
      className={classNames(className + '', direction === 'rtl' && 'webchat_warning--rtl')}
      height={ICON_SIZE_FACTOR * size}
      viewBox="0 0 13.1 13.1"
      width={ICON_SIZE_FACTOR * size}
    >
      <path d="M13.1,13.1H0L6.6,0L13.1,13.1z M7,10.5H6.1v0.9H7V10.5z M7,9.7V5.2H6.1v4.4L7,9.7z" fillRule="evenodd" />
    </svg>
  );
};

export default WarningNotificationIcon;
