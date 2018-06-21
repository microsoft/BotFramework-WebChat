import { css } from 'glamor';;
import React from 'react';

const ROOT_CSS = css({
  fontFamily: ['Calibri', 'Helvetica Neue', 'Arial', 'sans-serif'].map(font => `'${ font }'`).join(', ')
});

export default props =>
  <div className={ ROOT_CSS }>
    { props.value }
  </div>
