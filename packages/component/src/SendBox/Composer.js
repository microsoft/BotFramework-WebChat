import React from 'react';

import SendBoxContext from './Context';

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      context: {
        suggestedActions: [{
          text: 'Action 01'
        }, {
          text: 'Action 02'
        }, {
          text: 'Action 03'
        }, {
          text: 'Action 04'
        }, {
          text: 'Action 05'
        }, {
          text: 'Action 06'
        }, {
          text: 'Action 07'
        }, {
          text: 'Action 08'
        }, {
          text: 'Action 09'
        }, {
          text: 'Action 10'
        }]
      }
    };
  }

  render() {
    const { props: { children }, state: { context } } = this;

    return (
      <SendBoxContext.Provider value={ context }>
        { children }
      </SendBoxContext.Provider>
    );
  }
}
