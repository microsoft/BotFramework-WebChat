import classNames from 'classnames';
import React from 'react';

import { Components, Constants } from 'botframework-webchat';

const { connectDictationInterims } = Components;
const { DictateState: { DICTATING, STARTING } } = Constants;

export default connectDictationInterims()(
  ({
    className,
    dictateInterims,
    dictateState
  }) =>
    (dictateState === STARTING || dictateState === DICTATING) && !!dictateInterims.length &&
      <p className={ classNames(
        (className || '') + '',
        'dictating'
      ) }>
        { dictateInterims.map((interim, index) => <span key={ index }>{ interim }&nbsp;</span>) }
      </p>
)
