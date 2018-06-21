import React from 'react';

import MainContext from '../Context';

export default props =>
  <MainContext.Consumer>
    { ({ styleSet }) =>
      <div className={ styleSet.textCard }>
        { props.value }
      </div>
    }
  </MainContext.Consumer>
