import memoize from 'memoize-one';
import React from 'react';

import Context from './Context';

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.createContext = memoize(card => ({ card }));
  }

  render() {
    const { props } = this;
    const context = this.createContext(props.card);

    return (
      <Context.Provider value={ context }>
        { props.children }
      </Context.Provider>
    );
  }
}
