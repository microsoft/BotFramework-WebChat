import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Context from '../Context';

const ROOT_CSS = css({
  position: 'relative',

  '&.debug-view': {
    backgroundColor: 'rgba(0, 255, 0, .1)',
    borderColor: 'Green',
    borderStyle: 'solid',
    borderWidth: 2,
    boxSizing: 'border-box',
    padding: 10,

    '& > pre': {
      fontSize: '80%',
      margin: 0,
      overflowX: 'auto'
    }
  },

  '& > .debug:last-child': {
    '& > button': {
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
            {
              !!(debugView && debug) ?
                <pre>{ JSON.stringify(debug, null, 2) }</pre>
              :
                children
            }
            { !!debug &&
              <div className="debug">
                <button
                  onClick={ this.handleDebugViewClick }
                  type="button"
                >
                  &hellip;
                </button>
              </div>
            }
          </div>
        }
      </Context.Consumer>
    );
  }
}
