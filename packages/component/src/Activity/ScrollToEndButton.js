import { StateContext as ScrollToBottomStateContext } from 'react-scroll-to-bottom';

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import Localize from '../Localization/Localize';
import useStyleSet from '../hooks/useStyleSet';

const ScrollToEndButton = ({ className, scrollToEnd }) => {
  const [{ scrollToEndButton: scrollToEndButtonStyleSet }] = useStyleSet();

  return (
    <button className={classNames(scrollToEndButtonStyleSet + '', className + '')} onClick={scrollToEnd} type="button">
      <Localize text="New messages" />
    </button>
  );
};

ScrollToEndButton.defaultProps = {
  className: ''
};

ScrollToEndButton.propTypes = {
  className: PropTypes.string,
  scrollToEnd: PropTypes.func.isRequired,
  styleSet: PropTypes.shape({
    scrollToEndButton: PropTypes.any.isRequired
  }).isRequired
};

const WebChatConnectedScrollToEndButton = connectToWebChat(({ scrollToEnd }) => ({ scrollToEnd }))(ScrollToEndButton);

const ConnectedScrollToEndButton = props => (
  <ScrollToBottomStateContext.Consumer>
    {({ sticky }) => !sticky && <WebChatConnectedScrollToEndButton {...props} />}
  </ScrollToBottomStateContext.Consumer>
);

export default ConnectedScrollToEndButton;
