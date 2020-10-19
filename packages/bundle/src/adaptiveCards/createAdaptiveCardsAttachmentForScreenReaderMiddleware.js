import React from 'react';

import AdaptiveCardAttachment from './AttachmentForScreenReader/AdaptiveCardAttachment';
import RichCardAttachment from './AttachmentForScreenReader/RichCardAttachment';

const RICH_CARD_CONTENT_TYPES = [
  'application/vnd.microsoft.card.animation',
  'application/vnd.microsoft.card.audio',
  'application/vnd.microsoft.card.hero',
  'application/vnd.microsoft.card.oauth',
  'application/vnd.microsoft.card.receipt',
  'application/vnd.microsoft.card.signin',
  'application/vnd.microsoft.card.thumbnail',
  'application/vnd.microsoft.card.video'
];

export default function createAdaptiveCardsAttachmentMiddleware() {
  return () => next => (...args) => {
    const [{ activity, attachment }] = args;

    return RICH_CARD_CONTENT_TYPES.includes(attachment.contentType)
      ? () => <RichCardAttachment content={attachment.content} />
      : attachment.contentType === 'application/vnd.microsoft.card.adaptive'
      ? () => <AdaptiveCardAttachment content={attachment.content} />
      : next({ activity, attachment });
  };
}
