import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import connectWithContext from '../connectWithContext';
import Localize from '../Localization/Localize';

const {
  DictateState: {
    DICTATING,
    STARTING
  }
} = Constants;

const ROOT_CSS = css({
  alignItems: 'center',
  display: 'flex'
});

const connectDictationInterims = (...selectors) => connectWithContext(
  ({
    dictateInterims,
    dictateState
  }) => ({
    dictateInterims,
    dictateState
  }),
  ...selectors
)

// TODO: [P3] After speech started, when clicking on the transcript, it should
//       stop the dictation and allow the user to type-correct the transcript

export default connectDictationInterims(
  ({ styleSet }) => ({ styleSet })
)(
  ({ className, dictateInterims, dictateState, styleSet }) =>
    (dictateState === STARTING || dictateState === DICTATING) && (
      dictateInterims.length ?
        <p className={ classNames(
          styleSet.dictationInterims + '',
          ROOT_CSS + '',
          (className || '') + '',
          'dictating'
        ) }>
          { dictateInterims.map((interim, index) => <span key={ index }>{ interim }&nbsp;</span>) }
        </p>
      :
        <p className={ classNames(
          styleSet.dictationInterims + '',
          ROOT_CSS + '',
          (className || '') + '',
          'status'
        ) }>
          {
            dictateState === STARTING ?
              <Localize text="Starting&hellip;" />
            :
              <Localize text="Listening&hellip;" />
          }
        </p>
    )
)

export { connectDictationInterims }
