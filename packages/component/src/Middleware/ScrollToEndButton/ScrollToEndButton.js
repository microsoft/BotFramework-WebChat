import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef, useEffect } from 'react';

import useStyleSet from '../../hooks/useStyleSet';

const { useDirection, useLocalizer, useStyleOptions } = hooks;

const ScrollToEndButton = ({ onClick }) => {
  const [{ scrollToEndButton: scrollToEndButtonStyleSet }] = useStyleSet();
  const [{ scrollToEndButtonBehavior }] = useStyleOptions();
  const [direction] = useDirection();
  const localize = useLocalizer();

  const text = localize(scrollToEndButtonBehavior === 'any' ? 'TRANSCRIPT_MORE_MESSAGES' : 'TRANSCRIPT_NEW_MESSAGES');
  // useRef and useEffect is added to move focus on 'New messages' button when it is display on screen.
  const buttonReference = useRef();

  useEffect(() => {
    if (buttonReference?.current) {
      buttonReference?.current?.focus();
    }
  }, [buttonReference]);

  return (
    <button
      aria-label={text}
      className={classNames(
        'webchat__scroll-to-end-button',
        scrollToEndButtonStyleSet + '',
        direction === 'rtl' ? 'webchat__scroll-to-end-button--rtl' : ''
      )}
      onClick={onClick}
      ref={buttonReference}
      tabIndex={0}
      type="button"
    >
      {text}
    </button>
  );
};

ScrollToEndButton.defaultProps = {
  onClick: undefined
};

ScrollToEndButton.displayName = 'ScrollToEndButton';

ScrollToEndButton.propTypes = {
  onClick: PropTypes.func
};

export default ScrollToEndButton;
