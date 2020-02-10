import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

import TypingAnimation from './Assets/TypingAnimation';
import useDirection from './hooks/useDirection';
import useLastTypingAt from '../hooks/useLastTypingAt';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';

function useTypingIndicatorVisible() {
  const [lastTypingAt] = useLastTypingAt();

  const [{ typingAnimationDuration }] = useStyleOptions();

  const last = Math.max(Object.values(lastTypingAt));
  const typingAnimationTimeRemaining = last ? Math.max(0, typingAnimationDuration - Date.now() + last) : 0;

  const [value, setValue] = useState(typingAnimationTimeRemaining > 0);

  useEffect(() => {
    let timeout;

    if (typingAnimationTimeRemaining > 0) {
      setValue(true);
      timeout = setTimeout(() => setValue(false), typingAnimationTimeRemaining);
    } else {
      setValue(false);
    }

    return () => clearTimeout(timeout);
  }, [typingAnimationTimeRemaining]);

  return [value];
}

const TypingIndicator = () => {
  const [{ typingIndicator: typingIndicatorStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const [showTyping] = useTypingIndicatorVisible();

  return (
    showTyping && (
      <div className={classNames(typingIndicatorStyleSet + '', direction === 'rtl' ? 'rtl' : '')}>
        <TypingAnimation />
      </div>
    )
  );
};

export default TypingIndicator;

export { useTypingIndicatorVisible };
