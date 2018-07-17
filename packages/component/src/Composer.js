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

    this.state = {
      context: {
        activities,
        grammars: [],
        sendBoxValue: '',
        setGrammars: memoize(grammars => this.setState(() => ({ grammars }))),
        setSendBoxValue: nextValue => this.updateContext(['sendBoxValue'], () => nextValue),
        setUserID: nextUserID => this.updateContext(['userID'], () => nextUserID),
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
        }],
        userID: 'default-user'
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
