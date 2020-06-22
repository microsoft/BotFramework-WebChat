import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, useCallback } from 'react';

import useDirection from '../hooks/useDirection';
import useLocalizer from '../hooks/useLocalizer';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useStyleSet from '../hooks/useStyleSet';

import { safari } from '../Utils/detectBrowser';

const ScrollToEndButton = forwardRef(
  (
    { 'aria-valuemax': ariaValueMax, 'aria-valuemin': ariaValueMin, 'aria-valuenow': ariaValueNow, className, onClick },
    ref
  ) => {
    const [{ scrollToEndButton: scrollToEndButtonStyleSet }] = useStyleSet();
    const [direction] = useDirection();
    const localize = useLocalizer();
    const scrollToEnd = useScrollToEnd();

    const handleClick = useCallback(
      event => {
        onClick && onClick(event);
        scrollToEnd();
      },
      [onClick, scrollToEnd]
    );

    const handleKeyPress = useCallback(
      event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();

          onClick && onClick(event);
          scrollToEnd();
        }
      },
      [onClick, scrollToEnd]
    );

    const newMessageText = localize('TRANSCRIPT_NEW_MESSAGES');

    return (
      <li
        aria-label={newMessageText}
        aria-valuemax={ariaValueMax}
        aria-valuemin={ariaValueMin}
        aria-valuenow={ariaValueNow}
        className={classNames(
          'webchat__scrollToEndButton',
          scrollToEndButtonStyleSet + '',
          className + '',
          direction === 'rtl' ? 'webchat__overlay--rtl' : ''
        )}
        onClick={handleClick}
        onKeyPress={handleKeyPress}
        ref={ref}
        // iOS VoiceOver does not support role="separator" and treat it as role="presentation", which become invisible to VoiceOver.
        role={safari ? undefined : 'separator'}
        tabIndex={0}
      >
        {newMessageText}
      </li>
    );
  }
);

ScrollToEndButton.defaultProps = {
  'aria-valuemin': 0,
  className: '',
  onClick: undefined
};

ScrollToEndButton.displayName = 'ScrollToEndButton';

ScrollToEndButton.propTypes = {
  'aria-valuemax': PropTypes.number.isRequired,
  'aria-valuemin': PropTypes.number,
  'aria-valuenow': PropTypes.number.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default ScrollToEndButton;
