// This is for defaultProps: { children: undefined }
/* eslint no-undefined: "off" */

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
    const {
      sendFocusRef: { current }
    } = this.props;

    current && current.focus();
  }

  handleKeyDownCapture(event) {
    const { altKey, ctrlKey, key, metaKey, target } = event;

    const tabIndex = getTabIndex(target);

    if (altKey || (ctrlKey && key !== 'v') || metaKey || (!inputtableKey(key) && key !== 'Backspace')) {
      // Ignore if one of the utility key (except SHIFT) is pressed
      // E.g. CTRL-C on a link in one of the message should not jump to chat box
      // E.g. "A" or "Backspace" should jump to chat box
      return;
    }

    if (typeof tabIndex !== 'number' || tabIndex < 0) {
      event.stopPropagation();

      this.focus();
    }
  }

  render() {
    const {
      focus,
      handleKeyDownCapture,
      props: { children, disabled, sendFocusRef, ...otherProps },
      state: { context: stateContext }
    } = this;

    const context = this.createContext(stateContext, sendFocusRef);

    return (
      <Context.Provider value={context}>
        <div {...otherProps} onKeyDownCapture={!disabled && handleKeyDownCapture} style={DEFAULT_STYLE} tabIndex={-1}>
          {typeof children === 'function' ? children({ focus }) : children}
        </div>
      </Context.Provider>
    );
  }
}

Box.defaultProps = {
  children: undefined,
  disabled: false
};

Box.propTypes = {
  children: PropTypes.any,
  disabled: PropTypes.bool,
  sendFocusRef: PropTypes.shape({
    current: PropTypes.shape({
      focus: PropTypes.func
    })
  }).isRequired
};
