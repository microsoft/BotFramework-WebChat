import { css } from 'glamor';
import memoize from 'memoize-one';
import React from 'react';
import updateIn from 'simple-update-in';

import activities from './sampleActivities';
import Context from './Context';
import createStyleSet from './Styles/createStyleSet';
import mapMap from './Utils/mapMap';

function styleSetToClassNames(styleSet) {
  return mapMap(styleSet, (style, key) => key === 'options' ? style : css(style));
}

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.mergeContext = memoize((
      staticContext,
      lang,
      styleSet
    ) => ({
      ...staticContext,
      lang,
      styleSet: styleSetToClassNames(styleSet)
    }));

    const timestamp = new Date(Date.now() - 59000);

    this.state = {
      context: {
        activities,
        // activities: [{
        //   from: 'bot',
        //   id: 0,
        //   cards: [{
        //     text: 'This is a direct message.',
        //     type: 'message'
        //   }],
        //   timestamp
        // }, {
        //   from: 'user',
        //   id: 1,
        //   cards: [{
        //     subType: 'code',
        //     text: `function fancyAlert(arg) {\n  if (arg) {\n    $.facebox('div.#foo');\n  }\n}`,
        //     type: 'message'
        //   }],
        //   timestamp
        // }, {
        //   from: 'bot',
        //   id: 2,
        //   cards: [{
        //     attachment: 'assets/surface1.jpg',
        //     id: 0,
        //     text: 'The lightest, most powerful Surface Pro ever.',
        //     type: 'message'
        //   }, {
        //     attachment: 'assets/surface2.jpg',
        //     id: 1,
        //     text: 'The lightest, most powerful Surface Pro ever.',
        //     type: 'message'
        //   }, {
        //     attachment: 'assets/surface3.jpg',
        //     id: 2,
        //     text: 'The lightest, most powerful Surface Pro ever.',
        //     type: 'message'
        //   }, {
        //     attachment: 'assets/surface4.jpg',
        //     id: 3,
        //     text: 'The lightest, most powerful Surface Pro ever.',
        //     type: 'message'
        //   }],
        //   timestamp
        // }, {
        //   from: 'user',
        //   id: 3,
        //   cards: [{
        //     attachment: 'assets/surface4.jpg',
        //     id: 0,
        //     text: 'Empowering every person and every organization on the planet to achieve more.',
        //     type: 'message'
        //   }],
        //   timestamp
        // }],
        grammars: [],
        sendBoxValue: '',
        setGrammars: memoize(grammars => this.setState(() => ({ grammars }))),
        setSendBoxValue: nextValue => this.updateContext(['sendBoxValue'], () => nextValue),
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

  updateContext(path, updater) {
    this.setState(({ context }) => ({
      context: updateIn(context, path, updater)
    }));
  }

  render() {
    const {
      props: { children, lang, styleSet },
      state: { context: staticContext }
    } = this;

    const context = this.mergeContext(
      staticContext,
      lang || 'en-US',
      styleSet || createStyleSet()
    );

    return (
      <Context.Provider value={ context }>
        {
          typeof children === 'function' ?
            <Context.Consumer>{ context => children(context) }</Context.Consumer>
          :
            children
        }
      </Context.Provider>
    );
  }
}
