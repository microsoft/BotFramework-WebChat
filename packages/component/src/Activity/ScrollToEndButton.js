import {
  StateContext as ScrollToBottomStateContext
} from 'react-scroll-to-bottom';

import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import Localize from '../Localization/Localize';

const ScrollToEndButton = connectToWebChat(
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

export default props =>
  <ScrollToBottomStateContext.Consumer>
    { ({ sticky }) => !sticky && <ScrollToEndButton { ...props } /> }
  </ScrollToBottomStateContext.Consumer>
