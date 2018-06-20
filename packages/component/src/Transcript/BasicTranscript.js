import React from 'react';

import Activity from './Activity';
import Composer from './Composer';

export default class Transcript extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Composer>
        <ul>
          <li>
            <Activity />
          </li>
        </ul>
      </Composer>
    );
  }
}
