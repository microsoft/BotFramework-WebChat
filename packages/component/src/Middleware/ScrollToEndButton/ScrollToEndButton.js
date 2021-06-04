import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import useStyleSet from '../../hooks/useStyleSet';

const { useDirection, useLocalizer, useStyleOptions } = hooks;

const ScrollToEndButton = ({ onClick }) => {
  const [{ scrollToEndButton: scrollToEndButtonStyleSet }] = useStyleSet();
  const [{ scrollToEndButtonBehavior }] = useStyleOptions();
  const [direction] = useDirection();
  const localize = useLocalizer();

  const text = localize(scrollToEndButtonBehavior === 'any' ? 'TRANSCRIPT_MORE_MESSAGES' : 'TRANSCRIPT_NEW_MESSAGES');

  return (
    <button
      aria-label={text}
      className={classNames(
        'webchat__scroll-to-end-button',
        scrollToEndButtonStyleSet + '',
        direction === 'rtl' ? 'webchat__scroll-to-end-button--rtl' : ''
      )}
      onClick={onClick}
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
