import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import TypingAnimation from './Assets/TypingAnimation';

const TypingIndicator = ({
  language,
  lastTypingAt,
  styleSet: {
    options: { typingAnimationDuration },
    typingIndicator
  }
}) => {
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
        <TypingAnimation aria-label={localize('TypingIndicator', language)} />
      </div>
    )
  );
};

TypingIndicator.propTypes = {
  language: PropTypes.string.isRequired,
  lastTypingAt: PropTypes.any.isRequired,
  styleSet: PropTypes.shape({
    options: PropTypes.shape({
      typingAnimationDuration: PropTypes.number
    }).isRequired,
    typingIndicator: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ lastTypingAt, language, styleSet }) => ({ lastTypingAt, language, styleSet }))(
  TypingIndicator
);
