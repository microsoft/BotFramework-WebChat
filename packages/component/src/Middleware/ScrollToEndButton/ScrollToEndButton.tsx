import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { useRef } from 'react';

import useFocusAccessKeyEffect from '../../Utils/AccessKeySink/useFocusAccessKeyEffect';
import useLocalizeAccessKey from '../../hooks/internal/useLocalizeAccessKey';
import useStyleSet from '../../hooks/useStyleSet';
import { useLiveRegion } from '../../providers/LiveRegionTwin';

const { useDirection, useLocalizer, useStyleOptions } = hooks;

type ScrollToEndButtonProps = Readonly<{ onClick?: (() => void) | undefined }>;

const newMessagesAccessKey = 'U u Ü ü';

const ScrollToEndButton = ({ onClick }: ScrollToEndButtonProps) => {
  const focusRef = useRef(null);
  const [{ scrollToEndButton: scrollToEndButtonStyleSet }] = useStyleSet();
  const [{ scrollToEndButtonBehavior }] = useStyleOptions();
  const [direction] = useDirection();
  const localize = useLocalizer();
  const localizeAccessKey = useLocalizeAccessKey('accessible name');
  const shouldShowNewMessagesButton = scrollToEndButtonBehavior !== 'any';

  const text = localize(shouldShowNewMessagesButton ? 'TRANSCRIPT_NEW_MESSAGES' : 'TRANSCRIPT_MORE_MESSAGES');

  const liveRegionText = localize(
    'TRANSCRIPT_LIVE_REGION_NEW_MESSAGES_ALT',
    localizeAccessKey(newMessagesAccessKey),
    text
  );

  // Setup and announce new messages button shortcuts
  useFocusAccessKeyEffect(shouldShowNewMessagesButton ? newMessagesAccessKey : '', focusRef);

  useLiveRegion(
    () => shouldShowNewMessagesButton && <div className="webchat__scroll-to-end-button__status">{liveRegionText}</div>,
    [liveRegionText, shouldShowNewMessagesButton]
  );

  return (
    <button
      aria-keyshortcuts={shouldShowNewMessagesButton ? localizeAccessKey(newMessagesAccessKey) : undefined}
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

ScrollToEndButton.displayName = 'ScrollToEndButton';

// TODO: Will fail test if memo().
export default ScrollToEndButton;
