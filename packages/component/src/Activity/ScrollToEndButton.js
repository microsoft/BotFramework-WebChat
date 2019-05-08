import {
  StateContext as ScrollToBottomStateContext
} from 'react-scroll-to-bottom';

import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import Localize from '../Localization/Localize';

const ConnectedScrollToEndButton = connectToWebChat(
  ({ scrollToEnd, styleSet }) => ({ scrollToEnd, styleSet })
)(({ className, scrollToEnd, styleSet }) =>
  <button
    className={ classNames(
      styleSet.scrollToEndButton + '',
      (className || '') + ''
    ) }
    onClick={ scrollToEnd }
    type="button"
  >
    <Localize text="New messages" />
  </button>
)

const ScrollToEndButton = props =>
  <ScrollToBottomStateContext.Consumer>
    { ({ sticky }) => !sticky && <ConnectedScrollToEndButton { ...props } /> }
  </ScrollToBottomStateContext.Consumer>

export default ScrollToEndButton
