import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const SUGGESTED_ACTION_CSS = css({
  display: 'inline-block',
  whiteSpace: 'initial'
});

const SUGGESTED_ACTION_BUTTON_CSS = css({
    '&:focus, &:hover': {
        textDecoration: 'none',
        outline: 0
    }
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
        className={SUGGESTED_ACTION_BUTTON_CSS}
        disabled={ disabled }
        onClick={ click }
        type='button'
      >
        <nobr>{ text }</nobr>
      </button>
    </div>
)

export { connectSuggestedAction }
