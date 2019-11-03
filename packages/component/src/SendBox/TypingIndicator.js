import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import connectToWebChat from '../connectToWebChat';
import TypingAnimation from './Assets/TypingAnimation';
import useLocalize from '../hooks/useLocalize';
import useStyleOptions from '../hooks/useStyleOptions';
import useStyleSet from '../hooks/useStyleSet';

const TypingIndicator = ({ lastTypingAt }) => {
  const [{ typingAnimationDuration }] = useStyleOptions();
  const [{ typingIndicator }] = useStyleSet();
  const animationAriaLabel = useLocalize('TypingIndicator');

  const [showTyping, setShowTyping] = useState(false);

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
        <TypingAnimation aria-label={animationAriaLabel} />
      </div>
    )
  );
};

TypingIndicator.propTypes = {
  lastTypingAt: PropTypes.any.isRequired
};

export default connectToWebChat(({ lastTypingAt }) => ({ lastTypingAt }))(TypingIndicator);
