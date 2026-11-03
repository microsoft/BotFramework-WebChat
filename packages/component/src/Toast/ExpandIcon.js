import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React from 'react';
import { object, optional, pipe, readonly, string } from 'valibot';

const expandIconPropsSchema = pipe(
  object({
    className: optional(string())
  }),
  readonly()
);

const ExpandIcon = props => {
  const { className } = validateProps(expandIconPropsSchema, props);

  return (
    <svg
      className={(className || '') + ''}
      focusable={false}
      height="10"
      role="presentation"
      viewBox="0 0 16 10"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15.1484 0.648437L15.8516 1.35156L8 9.20312L0.148438 1.35156L0.851563 0.648438L8 7.79687L15.1484 0.648437Z" />
    </svg>
  );
};

export default ExpandIcon;
