import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import TypingAnimation from './Assets/TypingAnimation';

const TypingIndicator = ({ language, lastTypingAt, styleSet }) => {
  const {
    options: { typingAnimationDuration }
  } = styleSet;
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    let timeout;
    const last = Math.max(Object.values(lastTypingAt)); // check pollyfill
    if (last && Date.now() - last < typingAnimationDuration) {
      setShowTyping(true);
      timeout = setTimeout(() => setShowTyping(false), typingAnimationDuration - Date.now() + last);
    } else {
      setShowTyping(false);
    }

    return () => clearTimeout(timeout);
  }, [lastTypingAt, typingAnimationDuration]);

  return (
    showTyping && (
      <div className={styleSet.typingIndicator}>
        <TypingAnimation aria-label={localize('TypingIndicator', language)} />
      </div>
    )
  );
};

TypingIndicator.propTypes = {
  language: PropTypes.string.isRequired,
  lastTypingAt: PropTypes.any.isRequired,
  styleSet: PropTypes.shape({
    options: PropTypes.any.isRequired,
    typingIndicator: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ lastTypingAt, language, styleSet }) => ({ lastTypingAt, language, styleSet }))(
  TypingIndicator
);
