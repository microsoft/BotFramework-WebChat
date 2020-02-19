import { StateContext as ScrollToBottomStateContext } from 'react-scroll-to-bottom';

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';

import useActivities from '../hooks/useActivities';
import useDirection from '../hooks/useDirection';
import useFocusSendBox from '../hooks/useFocusSendBox';
import useLocalizer from '../hooks/useLocalizer';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useStyleSet from '../hooks/useStyleSet';

const ScrollToEndButton = ({ animating, className, sticky }) => {
  const [{ scrollToEndButton: scrollToEndButtonStyleSet }] = useStyleSet();
  const [activities] = useActivities();
  const [direction] = useDirection();
  const focusSendBox = useFocusSendBox();
  const localize = useLocalizer();
  const scrollToEnd = useScrollToEnd();

  const handleClick = useCallback(() => {
    scrollToEnd();
    focusSendBox();
  }, [focusSendBox, scrollToEnd]);

  const newMessageText = localize('TRANSCRIPT_NEW_MESSAGES');

  // Ignore activity types other than "message"
  const lastMessageActivity = [...activities].reverse().find(({ type }) => type === 'message');
  const lastShownActivityId = (lastMessageActivity || {}).id;
  const lastReadActivityIdRef = useRef(lastShownActivityId);

  const { current: lastReadActivityId } = lastReadActivityIdRef;

  if (sticky) {
    // If it is sticky, mark the activity ID as read.
    lastReadActivityIdRef.current = lastShownActivityId;
  }

  // Don't show the button if:
  // - The scroll bar is animating
  //   - Otherwise, this will cause a flashy button when: 1. Scroll to top, 2. Send something, 3. The button flashes when it is scrolling down
  // - It is already at the bottom (sticky)
  // - The last activity ID has been read
  if (animating || sticky || lastShownActivityId === lastReadActivityId) {
    return false;
  }

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
  className: ''
};

ScrollToEndButton.propTypes = {
  animating: PropTypes.bool.isRequired,
  className: PropTypes.string,
  sticky: PropTypes.bool.isRequired
};

const ConnectedScrollToEndButton = props => (
  <ScrollToBottomStateContext.Consumer>
    {({ animating, sticky }) => <ScrollToEndButton animating={animating} sticky={sticky} {...props} />}
  </ScrollToBottomStateContext.Consumer>
);

export default ConnectedScrollToEndButton;
