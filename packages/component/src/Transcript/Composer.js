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
            attachment: 'assets/surface1.jpg',
            id: 0,
            text: 'The lightest, most powerful Surface Pro ever.',
            type: 'message'
          }, {
            attachment: 'assets/surface2.jpg',
            id: 1,
            text: 'The lightest, most powerful Surface Pro ever.',
            type: 'message'
          }, {
            attachment: 'assets/surface3.jpg',
            id: 2,
            text: 'The lightest, most powerful Surface Pro ever.',
            type: 'message'
          }, {
            attachment: 'assets/surface4.jpg',
            id: 3,
            text: 'The lightest, most powerful Surface Pro ever.',
            type: 'message'
          }],
          timestamp
        }, {
          from: 'user',
          id: 3,
          cards: [{
            attachment: 'assets/surface4.jpg',
            id: 0,
            text: 'Empowering every person and every organization on the planet to achieve more.',
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
