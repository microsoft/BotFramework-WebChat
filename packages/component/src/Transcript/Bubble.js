import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { primarySmallFont } from '../Styles';
import TimeAgo from './TimeAgo';

const ROOT_CSS = css({
  maxWidth: 480,

  '& > .header-image': {
    backgroundPosition: '50% 50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    height: 240,
    width: '100%'
  },

  '& > .content': {
    backgroundColor: 'White',
    minHeight: 20,
    padding: 10
  },

  '& > .timestamp': {
    ...primarySmallFont,
    color: 'rgba(0, 0, 0, .2)',
    paddingTop: 5
  }
});

function createBackgroundImageStyle(url) {
  return { backgroundImage: `url(${ url })` };
}

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      headerImageStyle: !!props.image && createBackgroundImageStyle(props.image)
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      headerImageStyle: !!nextProps.image && createBackgroundImageStyle(nextProps.image)
    }));
  }

  render() {
    const { props, state } = this;

    return (
      <div className={ classNames(ROOT_CSS + '', (props.className || '') + '') }>
        { !!props.image &&
          <div className="header-image" style={ state.headerImageStyle } />
        }
        <div className="content">
          { props.children }
        </div>
        <div className="timestamp">
          <TimeAgo value={ props.timestamp } />
        </div>
      </div>
    );
  }
}
