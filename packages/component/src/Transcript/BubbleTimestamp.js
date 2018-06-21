import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { primarySmallFont } from '../Styles';
import Context from '../Context';
import TimeAgo from './TimeAgo';

const ROOT_CSS = css({
  '& > .header-image': {
    backgroundPosition: '50%',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    width: '100%'
  },

  '& > .content': {
    minHeight: 20,
    padding: 10
  }
});

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);

    this.createHeaderImageStyle = memoize(url => ({
      backgroundImage: `url(${ url })`
    }));
  }

  render() {
    const { props, state } = this;
    const headerImageStyle = this.createHeaderImageStyle(props.image);

    return (
      <Context.Consumer>
        { context =>
          <div className={ classNames(ROOT_CSS + '', context.styleSet.bubble + '', (props.className || '') + '') }>
            { !!props.image &&
              <div className="header-image" style={ headerImageStyle } />
            }
            <div className="content">
              { props.children }
            </div>
          </div>
        }
      </Context.Consumer>
    );
  }
}
