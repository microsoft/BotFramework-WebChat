import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import useDirection from '../hooks/useDirection';
import useLocalizer from '../hooks/useLocalizer';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useStyleSet from '../hooks/useStyleSet';

const ScrollToEndButton = ({ className, onClick }) => {
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

  const newMessageText = localize('TRANSCRIPT_NEW_MESSAGES');

  return (
    <button
      className={classNames(
        'webchat__scrollToEndButton',
        scrollToEndButtonStyleSet + '',
        className + '',
        direction === 'rtl' ? 'webchat__overlay--rtl' : ''
      )}
      onClick={handleClick}
      type="button"
    >
      {newMessageText}
    </button>
  );
};

ScrollToEndButton.defaultProps = {
  className: '',
  onClick: undefined
};

ScrollToEndButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default ScrollToEndButton;
