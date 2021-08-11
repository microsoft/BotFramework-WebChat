import { AttachmentForScreenReaderMiddleware } from 'botframework-webchat-api';
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

export default function createAdaptiveCardsAttachmentMiddleware(): AttachmentForScreenReaderMiddleware {
  return () =>
    next =>
    (...args) => {
      const [
        {
          attachment: { content, contentType }
        }
      ] = args;

      return content && RICH_CARD_CONTENT_TYPES.includes(contentType)
        ? () => <RichCardAttachment content={content} />
        : content && contentType === 'application/vnd.microsoft.card.adaptive'
        ? () => <AdaptiveCardAttachment content={content} />
        : next(...args);
    };
}
