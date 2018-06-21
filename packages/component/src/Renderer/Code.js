import React from 'react';

import MainContext from '../Context';

export default props =>
  <MainContext.Consumer>
    { ({ styleSet }) =>
      <pre className={ styleSet.codeCard }>
        { props.children }
      </pre>
    }
  </MainContext.Consumer>
