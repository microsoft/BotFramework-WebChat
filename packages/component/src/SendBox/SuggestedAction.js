import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import connectWithContext from '../connectWithContext';

const SUGGESTED_ACTION_CSS = css({
  display: 'inline-block',
  whiteSpace: 'initial'
});

const connectSuggestedAction = (...selectors) => connectWithContext(
  ({
    disabled,
    focusSendBox,
    onCardAction
  }) => ({
    disabled,
    onClick: (type, value) => {
      onCardAction({ type, value });
      focusSendBox();
    }
  }),
  ...selectors
)

export default connectSuggestedAction(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    disabled,
    onClick,
    styleSet,
    text,
    type,
    value
  }) =>
    <div className={ classNames(styleSet.suggestedAction + '', SUGGESTED_ACTION_CSS) }>
      <button
        disabled={ disabled }
        onClick={ onClick.bind(null, type, value) }
      >
        <nobr>{ text }</nobr>
      </button>
    </div>
)

export { connectSuggestedAction }
