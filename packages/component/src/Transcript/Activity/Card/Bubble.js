import classNames from 'classnames';
import memoize from 'memoize-one';
import React from 'react';

import MainContext from '../../../Context';

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);

    this.createHeaderImageStyle = memoize(url => ({
      backgroundImage: `url(${ url })`
    }));
  }

  render() {
    const { props } = this;
    const headerImageStyle = this.createHeaderImageStyle(props.image);

    return (
      <MainContext.Consumer>
        { context =>
          <div className={ classNames(context.styleSet.bubble + '', (props.className || '') + '') }>
            { !!props.image &&
              <div className="header-image" style={ headerImageStyle } />
            }
            <div className="content">
              { props.children }
            </div>
          </div>
        }
      </MainContext.Consumer>
    );
  }
}
