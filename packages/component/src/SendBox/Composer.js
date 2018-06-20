import React from 'react';

import SendBoxContext from './Context';

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      context: {}
    };
  }

  render() {
    return (
      <SendBoxContext.Provider value={ this.state.value }>
        { this.props.children }
      </SendBoxContext.Provider>
    );
  }
}
