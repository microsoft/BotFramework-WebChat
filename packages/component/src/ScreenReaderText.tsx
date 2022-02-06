/* eslint react/forbid-dom-props: ["off"] */

import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

import type { VFC } from 'react';

import useStyleToEmotionObject from './hooks/internal/useStyleToEmotionObject';

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

type ScreenReaderTextProps = {
  'aria-hidden'?: boolean;
  id?: string;
  text: string;
};

const ScreenReaderText: VFC<ScreenReaderTextProps> = forwardRef<HTMLDivElement, ScreenReaderTextProps>(
  ({ 'aria-hidden': ariaHidden, id, text }, ref) => {
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
  }
);

ScreenReaderText.defaultProps = {
  'aria-hidden': undefined,
  id: undefined
};

ScreenReaderText.propTypes = {
  'aria-hidden': PropTypes.bool,
  id: PropTypes.string,
  text: PropTypes.string.isRequired
};

export default ScreenReaderText;
