import { css } from 'glamor';
import React from 'react';

import { monospaceFont } from '../../Styles';

const ROOT_CSS = css({
  ...monospaceFont,
  margin: 0
});

export default props =>
  <pre className={ ROOT_CSS }>
    { props.children }
  </pre>
