import { connect } from 'react-redux';
import BasicFilm from 'react-film';
import classNames from 'classnames';
import React from 'react';

import Context from '../Context';
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

export default connect(({ suggestedActions }) => ({ suggestedActions }))(props =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <SuggestedActions
        { ...props }
        styleSet={ styleSet }
      />
    }
  </Context.Consumer>
)
