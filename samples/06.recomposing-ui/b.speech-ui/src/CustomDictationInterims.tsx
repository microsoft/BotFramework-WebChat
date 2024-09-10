import React, { memo } from 'react';

import { Constants, hooks } from 'botframework-webchat';

const { useDictateInterims, useDictateState } = hooks;

const {
  DictateState: { DICTATING, STARTING }
} = Constants;

const CustomDictationInterims = ({ className }: Readonly<{ className?: string | undefined }>) => {
  const [dictateInterims] = useDictateInterims();
  const [dictateState] = useDictateState();

  return (
    (dictateState === STARTING || dictateState === DICTATING) &&
    !!dictateInterims.length && (
      <p className={className}>
        {dictateInterims.map((interim, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={index}>{interim}&nbsp;</span>
        ))}
      </p>
    )
  );
};

export default memo(CustomDictationInterims);
