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
    displayText, text, type, value
  }) => ({
    click: () => {
      onCardAction({ displayText, text, type, value });
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
    buttonText,
    click,
    disabled,
    image,
    styleSet
  }) =>
    <div className={ classNames(styleSet.suggestedAction + '', SUGGESTED_ACTION_CSS) }>
      <button
        disabled={ disabled }
        onClick={ click }
      >
        {image && <img src={ image } />}
        <nobr>{ buttonText }</nobr>
      </button>
    </div>
)

export { connectSuggestedAction }
