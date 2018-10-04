import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import connectWithContext from '../connectWithContext';
import Localize from '../Localization/Localize';

const { DictateState } = Constants;

const ROOT_CSS = css({
  alignItems: 'center',
  display: 'flex'
});

const DictationInterims = ({ className, dictateInterims, dictateState, styleSet }) =>
  dictating && (
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
        'listening'
      ) }>
        <Localize text="Listening&hellip;" />
      </p>
  )

export default connectWithContext(
  ({ input: {
    dictateInterims,
    dictateState
  } }) => ({
    dictateInterims,
    dictating: dictateState === DictateState.STARTING || dictateState === DictateState.DICTATING
  }),
  ({
    styleSet
  }) => ({
    styleSet
  })
)(DictationInterims)
