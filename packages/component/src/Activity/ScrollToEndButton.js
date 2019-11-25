import { StateContext as ScrollToBottomStateContext } from 'react-scroll-to-bottom';

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import Localize from '../Localization/Localize';
import useFocusSendBox from '../hooks/useFocusSendBox';
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
      <Localize text="New messages" />
    </button>
  );
};

ScrollToEndButton.defaultProps = {
  className: ''
};

ScrollToEndButton.propTypes = {
  className: PropTypes.string,
  styleSet: PropTypes.shape({
    scrollToEndButton: PropTypes.any.isRequired
  }).isRequired
};

const ConnectedScrollToEndButton = props => (
  <ScrollToBottomStateContext.Consumer>
    {({ sticky }) => !sticky && <ScrollToEndButton {...props} />}
  </ScrollToBottomStateContext.Consumer>
);

export default ConnectedScrollToEndButton;
