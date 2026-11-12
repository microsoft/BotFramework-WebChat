/* eslint react/forbid-dom-props: ["off"] */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import React, { forwardRef, memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import styles from './ScreenReaderText.module.css';

const screenReaderTextPropsSchema = pipe(
  object({
    'aria-hidden': optional(boolean()),
    id: optional(string()),
    text: string()
  }),
  readonly()
);

type ScreenReaderTextProps = InferInput<typeof screenReaderTextPropsSchema>;

// eslint-disable-next-line prefer-arrow-callback
const ScreenReaderText = forwardRef<HTMLDivElement, ScreenReaderTextProps>(function ScreenReaderText(props, ref) {
  const { 'aria-hidden': ariaHidden, id, text } = validateProps(screenReaderTextPropsSchema, props);

  const classNames = useStyles(styles, webChatPrefixedClassName);

  if (ariaHidden && !id) {
    console.warn(
      'botframework-webchat assertion: when "aria-hidden" is set, the screen reader text should be read by "aria-labelledby". Thus, "id" must be set.'
    );
  }

  return (
    <div aria-hidden={ariaHidden} className={classNames['screen-reader-text']} id={id} ref={ref}>
      {text}
    </div>
  );
});

export default memo(ScreenReaderText);
export { screenReaderTextPropsSchema, type ScreenReaderTextProps };
