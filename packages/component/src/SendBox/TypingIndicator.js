import React, { useEffect, useState } from 'react';

import TypingAnimation from './Assets/TypingAnimation';
import useLastTypingAt from '../hooks/useLastTypingAt';
import useLocalize from '../hooks/useLocalize';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';

const useTypingIndicator = () => {
  const lastTypingAt = useLastTypingAt();

  return { lastTypingAt };
};

const TypingIndicator = () => {
  const [showTyping, setShowTyping] = useState(false);
  const { lastTypingAt } = useTypingIndicator();
  const typingAnimationLabel = useLocalize('TypingIndicator');
  const { typingAnimationDuration } = useStyleOptions();
  const { typingIndicator: typingIndicatorStyleSet } = useStyleSet();

  useEffect(() => {
    let timeout;
    const last = Math.max(Object.values(lastTypingAt));
    const typingAnimationTimeRemaining = typingAnimationDuration - Date.now() + last;

    if (last && typingAnimationTimeRemaining > 0) {
      setShowTyping(true);
      timeout = setTimeout(() => setShowTyping(false), typingAnimationTimeRemaining);
    } else {
      setShowTyping(false);
    }

    return () => clearTimeout(timeout);
  }, [lastTypingAt, typingAnimationDuration]);

  return (
    showTyping && (
      <div className={typingIndicatorStyleSet}>
        <TypingAnimation aria-label={typingAnimationLabel} />
      </div>
    )
  );
};

export default TypingIndicator;

export { useTypingIndicator };
