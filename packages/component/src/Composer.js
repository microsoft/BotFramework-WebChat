import { css } from 'glamor';
import memoize from 'memoize-one';
import React from 'react';

import Context from './Context';
import createStyleSet from './Styles/createStyleSet';

function mapMap(map, mapper) {
  return Object.keys(map).reduce((result, key) => {
    result[key] = mapper(map[key], key);

    return result;
  }, {});
}

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.mergeContext = memoize(styleSet => ({ styleSet }));
    this.stylesToClassNames = memoize(styleSet => mapMap(styleSet, (style, key) => key === 'options' ? style : css(style)));
  }

  render() {
    const { props } = this;
    const context = this.mergeContext(
      this.stylesToClassNames(props.styleSet || createStyleSet())
    );

    return (
      <Context.Provider value={ context }>
        { this.props.children }
      </Context.Provider>
    );
  }
}
