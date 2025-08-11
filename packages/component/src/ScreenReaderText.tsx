/* eslint react/forbid-dom-props: ["off"] */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { forwardRef, memo } from 'react';

import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';
import { useStyleToEmotionObject } from './hooks/internal/styleToEmotionObject';

const ROOT_STYLE = {
  // .sr-only - This component is intended to be invisible to the visual Web Chat user, but read by the AT when using a screen reader
  color: 'transparent',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  // We need to set top: 0, otherwise, it will repro:
  // - Run NVDA
  // - Make the transcript long enough to show the scrollbar
  // - Press SHIFT-TAB, focus on upload button
  // - Press up arrow multiple times
  top: 0,
  whiteSpace: 'nowrap',
  width: 1
};

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

  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  if (ariaHidden && !id) {
    console.warn(
      'botframework-webchat assertion: when "aria-hidden" is set, the screen reader text should be read by "aria-labelledby". Thus, "id" must be set.'
    );
  }

  return (
    <div aria-hidden={ariaHidden} className={rootClassName} id={id} ref={ref}>
      {text}
    </div>
  );
});

export default memo(ScreenReaderText);
export { screenReaderTextPropsSchema, type ScreenReaderTextProps };
