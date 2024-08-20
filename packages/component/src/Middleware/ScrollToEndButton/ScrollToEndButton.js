import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';

import useFocusAccessKeyEffect from '../../Utils/AccessKeySink/useFocusAccessKeyEffect';
import useLocalizeAccessKey from '../../hooks/internal/useLocalizeAccessKey';
import { usePushToLiveRegion } from '../../providers/LiveRegionTwin';
import useStyleSet from '../../hooks/useStyleSet';

const { useDirection, useLocalizer, useStyleOptions } = hooks;

const newMessagesAccessKey = 'U u Ü ü';

const ScrollToEndButton = ({ onClick }) => {
  const focusRef = useRef(null);
  const [{ scrollToEndButton: scrollToEndButtonStyleSet }] = useStyleSet();
  const [{ scrollToEndButtonBehavior }] = useStyleOptions();
  const [direction] = useDirection();
  const localize = useLocalizer();
  const localizeAccessKey = useLocalizeAccessKey();

  const text = localize(scrollToEndButtonBehavior === 'any' ? 'TRANSCRIPT_MORE_MESSAGES' : 'TRANSCRIPT_NEW_MESSAGES');

  // Setup and nnnounce new messages button shortcuts
  useFocusAccessKeyEffect(scrollToEndButtonBehavior === 'any' ? '' : newMessagesAccessKey, focusRef);
  usePushToLiveRegion(
    () =>
      scrollToEndButtonBehavior !== 'any' && (
        <div className="webchat__scroll-to-end-button__status">
          {localize('TRANSCRIPT_LIVE_REGION_NEW_MESSAGES_ALT', localizeAccessKey(newMessagesAccessKey), text)}
        </div>
      ),
    [scrollToEndButtonBehavior]
  );

  return (
    <button
      aria-label={text}
      className={classNames(
        'webchat__scroll-to-end-button',
        scrollToEndButtonStyleSet + '',
        direction === 'rtl' ? 'webchat__scroll-to-end-button--rtl' : ''
      )}
      onClick={onClick}
      ref={focusRef}
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
