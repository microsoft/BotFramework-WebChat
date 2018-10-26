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
        suggestedActions.map((suggestedAction, index) =>
          <SuggestedAction
            key={ index }
            text={ suggestedAction.title || suggestedAction.value }
            type={ suggestedAction.type }
            value={ suggestedAction.value }
          />
        )
      }
    </BasicFilm>
)

export { connectSuggestedActions }
