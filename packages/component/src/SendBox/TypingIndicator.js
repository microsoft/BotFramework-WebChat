import React, { useEffect, useState } from 'react';

import TypingAnimation from './Assets/TypingAnimation';
import useLastTypingAt from '../hooks/useLastTypingAt';
import useLocalize from '../hooks/useLocalize';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';

function useTypingIndicatorVisible() {
  const [lastTypingAt] = useLastTypingAt();

  const [{ typingAnimationDuration }] = useStyleOptions();

  const [value, setValue] = useState(false);

  useEffect(() => {
    let timeout;
    const last = Math.max(Object.values(lastTypingAt));
    const typingAnimationTimeRemaining = typingAnimationDuration - Date.now() + last;

    if (last && typingAnimationTimeRemaining > 0) {
      setValue(true);
      timeout = setTimeout(() => setValue(false), typingAnimationTimeRemaining);
    } else {
      setValue(false);
    }

    return () => clearTimeout(timeout);
  }, [lastTypingAt, typingAnimationDuration]);

  return [
    value,
    () => {
      throw new Error('TypingIndicatorVisible cannot be set.');
    }
  ];
}

const TypingIndicator = () => {
  const [showTyping] = useTypingIndicatorVisible();

  const [{ typingIndicator: typingIndicatorStyleSet }] = useStyleSet();

  const typingAnimationLabel = useLocalize('TypingIndicator');

  return (
    showTyping && (
      <div className={typingIndicatorStyleSet}>
        <TypingAnimation aria-label={typingAnimationLabel} />
      </div>
    )
  );
};

export default TypingIndicator;

export { useTypingIndicatorVisible };
