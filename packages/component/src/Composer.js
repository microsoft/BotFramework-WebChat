import React from 'react';

import Context from './Context';

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      context: {}
    };
  }

  render() {
    return (
      <Context.Provider value={ this.state.context }>
        { this.props.children }
      </Context.Provider>
    );
  }
}
