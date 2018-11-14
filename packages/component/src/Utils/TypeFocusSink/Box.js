import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import Context from './Context';
import getTabIndex from './getTabIndex';
import inputtableKey from './inputtableKey';

const DEFAULT_STYLE = { outline: 0 };

export default class Box extends React.Component {
  constructor(props) {
    super(props);

    this.focus = this.focus.bind(this);
    this.handleKeyDownCapture = this.handleKeyDownCapture.bind(this);

    this.createContext = memoize((staticContext, sendFocusRef = React.createRef()) => ({
      ...staticContext,
      sendFocusRef
    }));

    this.state = {
      context: {}
    };
  }

  focus() {
    const { current } = this.props.sendFocusRef;

    current && current.focus();
  }

  handleKeyDownCapture(event) {
    const target = event.target;
    const tabIndex = getTabIndex(target);

    if (
      event.altKey
      || (event.ctrlKey && event.key !== 'v')
      || event.metaKey
      || (!inputtableKey(event.key) && event.key !== 'Backspace')
    ) {
      // Ignore if one of the utility key (except SHIFT) is pressed
      // E.g. CTRL-C on a link in one of the message should not jump to chat box
      // E.g. "A" or "Backspace" should jump to chat box
      return;
    }

    if (
      typeof tabIndex !== 'number'
      || tabIndex < 0
    ) {
      event.stopPropagation();

      this.focus();
    }
  }

  render() {
    const { props: { children, disabled, sendFocusRef, ...otherProps }, state } = this;
    const context = this.createContext(state.context, sendFocusRef);

    return (
      <Context.Provider value={ context }>
        <div
          { ...otherProps }
          onKeyDownCapture={ !disabled && this.handleKeyDownCapture }
          style={ DEFAULT_STYLE }
          tabIndex={ -1 }
        >
          { typeof children === 'function' ? children({ focus: this.focus }) : children }
        </div>
      </Context.Provider>
    );
  }
}

Box.propTypes = {
  disabled: PropTypes.bool
};
