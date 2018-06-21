import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Activity from './Activity';
import Composer from './Composer';

const ROOT_CSS = css({
  listStyleType: 'none',
  margin: 0,
  padding: 0
});

export default class Transcript extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { props } = this;

    return (
      <Composer>
        <ul className={ classNames(ROOT_CSS + '', props.className + '') }>
          <li>
            <Activity />
          </li>
        </ul>
      </Composer>
    );
  }
}
