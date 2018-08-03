import BasicFilm from 'react-film';
import classNames from 'classnames';
import React from 'react';

import { withStyleSet } from '../Context';
import MainContext from '../Context';
import SuggestedAction from './SuggestedAction';

export default withStyleSet(({ className, styleSet }) =>
  <MainContext.Consumer>
    { ({ suggestedActions }) => !!suggestedActions.length &&
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
              text={ suggestedAction.title }
              type={ suggestedAction.type }
              value={ suggestedAction.value }
            />
          )
        }
      </BasicFilm>
    }
  </MainContext.Consumer>
)
