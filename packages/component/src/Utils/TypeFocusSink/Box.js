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

    this.state = {
      context: {
        focusableRef: React.createRef()
      }
    };
  }

  focus() {
    const { current } = this.state.context.focusableRef;

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

      // let key;

      // Quirks: onKeyDown we re-focus, but the newly focused element does not receive the subsequent onKeyPress event
      //         It is working in Chrome/Firefox/IE, confirmed not working in Edge/16
      //         So we are manually appending the key if they can be inputted in the box
      // if (/(^|\s)Edge\/16\./.test(window.navigator.userAgent)) {
      //   key = inputtableKey(event.key);
      // }

      this.focus();
    }
  }

  render() {
    const { props: { children, disabled, ...otherProps }, state } = this;

    return (
      <Context.Provider value={ state.context }>
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
