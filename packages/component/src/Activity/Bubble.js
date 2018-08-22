import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { withStyleSet } from '../Context';

const ROOT_CSS = css({
  position: 'relative',

  '&.debug-view': {
    backgroundColor: 'rgba(0, 255, 0, .1)',
    borderColor: 'Green',
    borderStyle: 'solid',
    borderWidth: 2,
    padding: 10,

    '& > pre': {
      margin: 0
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

class Bubble extends React.Component {
  constructor(props) {
    super(props);

    this.handleDebugViewClick = this.handleDebugViewClick.bind(this);

    this.state = {
      debugView: false
    };
  }

  handleDebugViewClick() {
    this.setState(({ debugView }) => ({ debugView: !debugView }));
  }

  render() {
    const {
      props: { attachment, children, className, styleSet },
      state: { debugView }
    } = this;

    return (
      <div
        className={ classNames(
          ROOT_CSS + '',
          styleSet.bubble + '',
          (className || '') + '',
          { 'debug-view': debugView }
        ) }
        style={{
          position: 'relative'
        }}
      >
        {
          debugView ?
            <pre>{ JSON.stringify(attachment, null, 2) }</pre>
          :
            children
        }
        <div className="debug">
          <button
            onClick={ this.handleDebugViewClick }
            type="button"
          >
            &hellip;
          </button>
        </div>
      </div>
    );
  }
}

export default withStyleSet(Bubble)
