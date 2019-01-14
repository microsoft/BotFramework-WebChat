import BasicFilm from 'react-film';
import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import SuggestedAction from './SuggestedAction';

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
            text,
            title,
            type,
            value
          },
          index
        ) =>
          <SuggestedAction
            buttonText={
              type === 'messageBack' ?
                title || displayText
              :
                title || (typeof value !== 'string') ? JSON.stringify(value) : value
            }
            displayText={ displayText }
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
