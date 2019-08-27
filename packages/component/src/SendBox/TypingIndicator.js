import React, { useEffect, useState } from 'react';

import { useLocalize } from '../Localization/Localize';
import TypingAnimation from './Assets/TypingAnimation';
import useStyleSet from '../hooks/useStyleSet';
import useWebChat from '../useWebChat';

const useTypingIndicator = () => {
  const { lastTypingAt } = useWebChat(state => state);

  return { lastTypingAt };
};

const TypingIndicator = () => {
  const [showTyping, setShowTyping] = useState(false);
  const { lastTypingAt } = useTypingIndicator();
  const typingAnimationLabel = useLocalize('TypingIndicator');
  const {
    options: { typingAnimationDuration },
    typingIndicator
  } = useStyleSet();

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
      <div className={typingIndicator}>
        <TypingAnimation aria-label={typingAnimationLabel} />
      </div>
    )
  );
};

export default TypingIndicator;

export { useTypingIndicator };
