import React from 'react';
import DebugAdaptiveCardAttachment from './DebugAdaptiveCardAttachment';
import JSONDebugView from './JSONDebugView';

export default function() {
  return () => next => ({ activity, attachment }) =>
    attachment.contentType === 'application/vnd.microsoft.card.adaptive' ? (
      <DebugAdaptiveCardAttachment activity={activity} attachment={attachment}>
        <JSONDebugView debug={attachment}>{next({ activity, attachment })}</JSONDebugView>
      </DebugAdaptiveCardAttachment>
    ) : (
      <JSONDebugView debug={attachment}>{next({ activity, attachment })}</JSONDebugView>
    );
}
