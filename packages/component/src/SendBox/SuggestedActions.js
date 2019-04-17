import BasicFilm from 'react-film';
import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import SuggestedAction from './SuggestedAction';

function suggestedActionText({ displayText, title, type, value }) {
  if (type === 'messageBack') {
    return title || displayText
  } else if (title) {
    return title;
  } else if (typeof value === 'string') {
    return value;
  } else {
    return JSON.stringify(value);
  }
}

const connectSuggestedActions = (...selectors) => connectToWebChat(
  ({
    language,
    suggestedActions
  }) => ({
    language,
    suggestedActions
  }),
  ...selectors
)

export default connectSuggestedActions(
  ({ styleSet }) => ({ styleSet })
)(({
  className,
  styleSet,
  suggestedActions
}) =>
  !!suggestedActions.length &&
    <BasicFilm
      autoCenter={ false }
      className={ classNames(
        styleSet.suggestedActions + '',
        className
      ) }
      showDots={ false }
      styleSet={ styleSet.options.suggestedActionsStyleSet }
    >
      {
        suggestedActions.map((
          {
            displayText,
            image,
            text,
            title,
            type,
            value
          },
          index
        ) =>
          <SuggestedAction
            buttonText={
             suggestedActionText({ displayText, title, type, value })
            }
            displayText={ displayText }
            image={ image }
            key={ index }
            text={ text }
            type={ type }
            value={ value }
          />
        )
      }
    </BasicFilm>
)

export { connectSuggestedActions }
