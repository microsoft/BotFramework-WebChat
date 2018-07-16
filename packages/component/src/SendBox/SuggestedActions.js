import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { withStyleSet } from '../Context';
import BasicFilm from 'react-film';
import MainContext from '../Context';

const SUGGESTED_ACTION_CSS = css({
  display: 'inline-block',
  whiteSpace: 'initial',
});

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
            <div
              className={ classNames(styleSet.suggestedAction + '', SUGGESTED_ACTION_CSS) }
              key={ index }
            >
              <button>
                <nobr>{ suggestedAction.text }</nobr>
              </button>
            </div>
          )
        }
      </BasicFilm>
    }
  </MainContext.Consumer>
)
