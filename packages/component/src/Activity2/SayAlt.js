import { css } from 'glamor';
import React from 'react';

// TODO: Although this is for development purpose, prettify it
const ROOT_CSS = css({
  color: 'Red',
  margin: 0
});

export default ({ speak }) =>
  !!speak && <pre className={ ROOT_CSS }>{ speak }</pre>
