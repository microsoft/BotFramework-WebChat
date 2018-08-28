import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Context from '../Context';

const ROOT_CSS = css({
  position: 'relative',

  '&.debug-view': {
    '& > pre': {
      backgroundColor: 'rgba(230, 255, 230, 1)',
      borderColor: 'Green',
      borderStyle: 'solid',
      borderWidth: 2,
      boxSizing: 'border-box',
      fontSize: '80%',
      height: '100%',
      left: 0,
      margin: 0,
      overflowX: 'auto',
      padding: 10,
      position: 'absolute',
      top: 0,
      width: '100%'
    }
  },

  '& > button.debug': {
    backgroundColor: 'Transparent',
    border: 0,
    cursor: 'pointer',
    outline: 0,
    padding: 10,
    position: 'absolute',
    right: 0,
    top: 0,

    '&:focus, &:hover': {
      backgroundColor: 'rgba(0, 0, 0, .1)'
    }
  }
});

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.handleDebugViewClick = this.handleDebugViewClick.bind(this);

    this.state = {
      debugView: false
    };
  }

  handleDebugViewClick() {
    this.setState(({ debugView }) => ({
      debugView: !debugView
    }));
  }

  render() {
    const {
      props: { debug, children, className },
    } = this;

    const debugView = this.state.debugView && !!debug;

    return (
      <Context.Consumer>
        { ({ styleSet }) =>
          <div
            className={ classNames(
              ROOT_CSS + '',
              styleSet.bubble2 + '',
              { 'debug-view': debugView },
              (className || '') + ''
            ) }
          >
            { children }
            { !!debugView && <pre>{ JSON.stringify(debug, null, 2) }</pre> }
            { !!debug &&
              <button
                className="debug"
                onClick={ this.handleDebugViewClick }
                type="button"
              >
                &hellip;
              </button>
            }
          </div>
        }
      </Context.Consumer>
    );
  }
}
