import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { withStyleSet } from '../Context';

const ROOT_CSS = css({});

export default withStyleSet(props =>
  <button
    className={ classNames(styleSet.suggestedAction + '', ROOT_CSS + '', (props.className || '') + '') }
  >
    <nobr>{ props.children }</nobr>
  </button>
)
