import BasicFilm from 'react-film';
import classNames from 'classnames';
import React from 'react';

import connectWithContext from '../connectWithContext';
import SuggestedAction from './SuggestedAction';

const SuggestedActions = ({ className, styleSet, suggestedActions }) =>
  !!suggestedActions.length &&
    <BasicFilm
      autoCenter={ false }
      className={ classNames(styleSet.suggestedActions + '', className) }
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

export default connectWithContext(
  ({ suggestedActions }) => ({ suggestedActions }),
  ({ styleSet }) => ({ styleSet })
)(SuggestedActions)
