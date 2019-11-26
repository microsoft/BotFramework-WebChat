import { StateContext as ScrollToBottomStateContext } from 'react-scroll-to-bottom';

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import useFocusSendBox from '../hooks/useFocusSendBox';
import useLocalize from '../hooks/useLocalize';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useStyleSet from '../hooks/useStyleSet';

const ScrollToEndButton = ({ className }) => {
  const [{ scrollToEndButton: scrollToEndButtonStyleSet }] = useStyleSet();
  const focusSendBox = useFocusSendBox();
  const scrollToEnd = useScrollToEnd();

  const handleClick = useCallback(() => {
    scrollToEnd();
    focusSendBox();
  }, [focusSendBox, scrollToEnd]);

  return (
    <button className={classNames(scrollToEndButtonStyleSet + '', className + '')} onClick={handleClick} type="button">
      {useLocalize('New messages')}
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
    {({ sticky }) => !sticky && <ScrollToEndButton {...props} />}
  </ScrollToBottomStateContext.Consumer>
);

export default ConnectedScrollToEndButton;
