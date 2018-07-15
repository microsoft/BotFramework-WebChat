import { css } from 'glamor';
import memoize from 'memoize-one';
import React from 'react';

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
        grammars: [],
        setGrammars: memoize(grammars => this.setState(() => ({ grammars }))),
      }
    };
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
