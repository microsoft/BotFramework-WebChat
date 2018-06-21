import React from 'react';

import Context from './Context';

import createStyleSet from './Styles/createStyleSet';

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      context: {
        styleSet: props.styleSet || createStyleSet()
      }
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
