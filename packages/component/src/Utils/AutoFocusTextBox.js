import PropTypes from 'prop-types';
import React from 'react';

import getTabIndex from './getTabIndex';
import inputtableKey from './inputtableKey';

function resolveTarget(target) {
  if (typeof target === 'string') {
    return document.querySelector(target);
  } else {
    return target;
  }
}

export default class AutoFocusTextBox extends React.Component {
  constructor(props) {
    super(props);

    this.handleKeyDownCapture = this.handleKeyDownCapture.bind(this);

    this.target = null;
    this.textBoxRef = React.createRef();
  }

  componentDidMount() {
    this.refreshTarget(this.props.target);
  }

  componentDidUpdate() {
    this.refreshTarget(this.props.target);
  }

  componentWillUnmount() {
    this.refreshTarget();
  }

  refreshTarget(nextTarget) {
    const prevTargetNode = resolveTarget(this.target);
    const nextTargetNode = resolveTarget(nextTarget);

    if (prevTargetNode !== nextTargetNode) {
      prevTargetNode && prevTargetNode.removeEventListener('keydown', this.handleKeyDownCapture, true);
      nextTargetNode && nextTargetNode.addEventListener('keydown', this.handleKeyDownCapture, true);
    }

    this.target = nextTarget;
  }

  handleKeyDownCapture(event) {
    const target = event.target;
    const tabIndex = getTabIndex(target);

    if (
      event.altKey
      || event.ctrlKey
      || event.metaKey
      || (!inputtableKey(event.key) && event.key !== 'Backspace')
    ) {
      // Ignore if one of the utility key (except SHIFT) is pressed
      // E.g. CTRL-C on a link in one of the message should not jump to chat box
      // E.g. "A" or "Backspace" should jump to chat box
      return;
    }

    if (
      // target === findDOMNode(this.historyRef)
      // || typeof tabIndex !== 'number'
      typeof tabIndex !== 'number'
      || tabIndex < 0
    ) {
      event.stopPropagation();

      let key;

      // Quirks: onKeyDown we re-focus, but the newly focused element does not receive the subsequent onKeyPress event
      //         It is working in Chrome/Firefox/IE, confirmed not working in Edge/16
      //         So we are manually appending the key if they can be inputted in the box
      if (/(^|\s)Edge\/16\./.test(window.navigator.userAgent)) {
          key = inputtableKey(event.key);
      }

      if (this.textBoxRef.current) {
        key && this.props.onChange && this.props.onChange({ target: { value: this.props.value + key } });
        this.textBoxRef.current.focus();
      }
    }
  }

  render() {
    const { props } = this;

    return (
      <input
        disabled={ props.disabled }
        onChange={ props.onChange }
        placeholder={ props.placeholder }
        readOnly={ props.readOnly }
        ref={ this.textBoxRef }
        type="text"
        value={ props.value }
      />
    );
  }
}

AutoFocusTextBox.defaultProps = {
  target: 'body'
};

AutoFocusTextBox.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  target: PropTypes.any,
  value: PropTypes.string
};
