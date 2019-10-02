import React from 'react';

import { Components, Constants } from 'botframework-webchat';

const { connectDictationInterims } = Components;
const {
  DictateState: { DICTATING, STARTING }
} = Constants;

export default connectDictationInterims()(
  ({ className, dictateInterims, dictateState }) =>
    (dictateState === STARTING || dictateState === DICTATING) &&
    !!dictateInterims.length && (
      <p className={className}>
        {dictateInterims.map((interim, index) => (
          <span key={index}>{interim}&nbsp;</span>
        ))}
      </p>
    )
);
