import { StateContext as ScrollToBottomStateContext } from 'react-scroll-to-bottom';

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Localize from '../Localization/Localize';
import useStyleSet from '../hooks/useStyleSet';
import useWebChat from '../useWebChat';

const useScrollToEndButton = () => {
  const { scrollToEnd } = useWebChat(state => state);

  return { scrollToEnd };
};

const ScrollToEndButton = ({ className }) => {
  const { scrollToEnd } = useScrollToEndButton();
  const styleSet = useStyleSet();

  return (
    <button className={classNames(styleSet.scrollToEndButton + '', className + '')} onClick={scrollToEnd} type="button">
      <Localize text="New messages" />
    </button>
  );
};

ScrollToEndButton.defaultProps = {
  className: ''
};

ScrollToEndButton.propTypes = {
  className: PropTypes.string
};

const WebChatConnectedScrollToEndButton = ScrollToEndButton;

const ConnectedScrollToEndButton = props => (
  <ScrollToBottomStateContext.Consumer>
    {({ sticky }) => !sticky && <WebChatConnectedScrollToEndButton {...props} />}
  </ScrollToBottomStateContext.Consumer>
);

export default ConnectedScrollToEndButton;

export { useScrollToEndButton };
