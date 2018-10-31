import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const SUGGESTED_ACTION_CSS = css({
  display: 'inline-block',
  whiteSpace: 'initial'
});

const connectSuggestedAction = (...selectors) => connectToWebChat(
  ({
    disabled,
    focusSendBox,
    language,
    onCardAction
  }, {
    type, value
  }) => ({
    click: () => {
      onCardAction({ type, value });
      focusSendBox();
    },
    disabled,
    language
  }),
  ...selectors
)

export default connectSuggestedAction(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    disabled,
    click,
    styleSet,
    text
  }) =>
    <div className={ classNames(styleSet.suggestedAction + '', SUGGESTED_ACTION_CSS) }>
      <button
        disabled={ disabled }
        onClick={ click }
      >
        <nobr>{ text }</nobr>
      </button>
    </div>
)

export { connectSuggestedAction }
