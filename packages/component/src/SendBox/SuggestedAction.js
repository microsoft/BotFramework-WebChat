import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Context from '../Context';

const SUGGESTED_ACTION_CSS = css({
  display: 'inline-block',
  whiteSpace: 'initial'
});

export default ({ text, type, value }) =>
  <Context.Consumer>
    { ({ disabled, focusSendBox, onCardAction, styleSet }) =>
      <div className={ classNames(styleSet.suggestedAction + '', SUGGESTED_ACTION_CSS) }>
        <button disabled={ disabled } onClick={ () => {
          onCardAction({ type, value });
          focusSendBox();
        } }>
          <nobr>{ text }</nobr>
        </button>
      </div>
    }
  </Context.Consumer>
