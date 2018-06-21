import React from 'react';

import Context from './Context';

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    const timestamp = new Date(Date.now() - 59000);

    this.state = {
      context: {
        activities: [{
          from: 'bot',
          id: 0,
          cards: [{
            text: 'This is a direct message.',
            type: 'message'
          }],
          timestamp
        }, {
          from: 'user',
          id: 1,
          cards: [{
            subType: 'code',
            text: `function fancyAlert(arg) {\n  if (arg) {\n    $.facebox('div.#foo');\n  }\n}`,
            type: 'message'
          }],
          timestamp
        }, {
          from: 'bot',
          id: 2,
          cards: [{
            attachment: 'assets/surface4.jpg',
            text: 'This is a cat.',
            type: 'message'
          }, {
            attachment: 'assets/surface1.jpg',
            text: 'This is a cat.',
            type: 'message'
          }],
          timestamp
        }]
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
