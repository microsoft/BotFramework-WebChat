import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import React, { useRef } from 'react';

import useFocusAccessKeyEffect from '../../Utils/AccessKeySink/useFocusAccessKeyEffect';
import useLocalizeAccessKey from '../../hooks/internal/useLocalizeAccessKey';
import { useLiveRegion } from '../../providers/LiveRegionTwin';

import styles from './ScrollToEndButton.module.css';

const { useLocalizer, useStyleOptions } = hooks;

type ScrollToEndButtonProps = Readonly<{ onClick?: (() => void) | undefined }>;

const newMessagesAccessKey = 'U u Ü ü';

const ScrollToEndButton = ({ onClick }: ScrollToEndButtonProps) => {
  const focusRef = useRef(null);
  // Keeps the "webchat__scroll-to-end-button" class name.
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const [{ scrollToEndButtonBehavior }] = useStyleOptions();
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
      className={classNames['scroll-to-end-button']}
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
