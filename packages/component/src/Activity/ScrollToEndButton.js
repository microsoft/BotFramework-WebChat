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
  const [direction] = useDirection();
  const [{ scrollToEndButton: scrollToEndButtonStyleSet }] = useStyleSet();
  const focusSendBox = useFocusSendBox();
  const localize = useLocalizer();
  const scrollToEnd = useScrollToEnd();
  const [activities] = useActivities();
  const handleClick = useCallback(() => {
    scrollToEnd();
    focusSendBox();
  }, [focusSendBox, scrollToEnd]);
  const newMessageText = localize('TRANSCRIPT_NEW_MESSAGES');

  const lastActivityId = (activities[activities.length - 1] || {}).id;
  const prevLastActivityIdRef = useRef(lastActivityId);
  const { current: prevLastActivityId } = prevLastActivityIdRef;

  if (sticky) {
    prevLastActivityIdRef.current = lastActivityId;
  }

  return !animating && !sticky && lastActivityId !== prevLastActivityId && (
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
  className: PropTypes.string
};

const ConnectedScrollToEndButton = props => (
  <ScrollToBottomStateContext.Consumer>
    {({ animating, sticky }) => <ScrollToEndButton animating={animating} sticky={sticky} {...props} />}
  </ScrollToBottomStateContext.Consumer>
);

export default ConnectedScrollToEndButton;
