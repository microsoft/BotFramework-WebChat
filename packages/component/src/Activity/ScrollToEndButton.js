import {
  FunctionContext as ScrollToBottomFunctionContext,
  StateContext as ScrollToBottomStateContext
} from 'react-scroll-to-bottom';

import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import Localize from '../Localization/Localize';

const ScrollToEndButton = connectToWebChat(
  ({ scrollToEnd, styleSet }) => ({ scrollToEnd, styleSet })
)(({ children, className, scrollToEnd, styleSet }) =>
  <button
    className={ classNames(
      styleSet.scrollToEndButton + '',
      (className || '') + ''
    ) }
    onClick={ scrollToEnd }
  >
    <Localize text="New messages" />
  </button>
)

export default props =>
  <ScrollToBottomStateContext.Consumer>
    { ({ animating, atEnd }) => !animating && !atEnd && <ScrollToEndButton { ...props } /> }
  </ScrollToBottomStateContext.Consumer>
