import React from 'react';

import { AttachmentMiddleware } from 'botframework-webchat-api';

import AdaptiveCardAttachment from './Attachment/AdaptiveCardAttachment';
import AnimationCardAttachment from './Attachment/AnimationCardAttachment';
import AudioCardAttachment from './Attachment/AudioCardAttachment';
import HeroCardAttachment from './Attachment/HeroCardAttachment';
import OAuthCardAttachment from './Attachment/OAuthCardAttachment';
import ReceiptCardAttachment from './Attachment/ReceiptCardAttachment';
import SignInCardAttachment from './Attachment/SignInCardAttachment';
import ThumbnailCardAttachment from './Attachment/ThumbnailCardAttachment';
import VideoCardAttachment from './Attachment/VideoCardAttachment';

export default function createAdaptiveCardsAttachmentMiddleware(): AttachmentMiddleware {
  // This is not returning a React component, but a render function.
  return () =>
    next =>
    (...args) => {
      const attachment = args[0]?.attachment;

      if (!attachment || !attachment.content) {
        return next(...args);
      }

      return attachment.contentType === 'application/vnd.microsoft.card.hero' ? (
        <HeroCardAttachment attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.adaptive' ? (
        <AdaptiveCardAttachment attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.animation' &&
        typeof attachment.content === 'object' ? (
        <AnimationCardAttachment attachment={attachment as typeof attachment & { content: object }} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.audio' &&
        typeof attachment.content === 'object' ? (
        <AudioCardAttachment attachment={attachment as typeof attachment & { content: object }} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.oauth' ? (
        <OAuthCardAttachment attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.receipt' &&
        typeof attachment.content === 'object' ? (
        <ReceiptCardAttachment attachment={attachment as typeof attachment & { content: object }} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.signin' &&
        typeof attachment.content === 'object' ? (
        <SignInCardAttachment attachment={attachment as typeof attachment & { content: object }} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.thumbnail' &&
        typeof attachment.content === 'object' ? (
        <ThumbnailCardAttachment attachment={attachment as typeof attachment & { content: object }} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.video' &&
        typeof attachment.content === 'object' ? (
        <VideoCardAttachment attachment={attachment as typeof attachment & { content: object }} />
      ) : (
        next(...args)
      );
    };
}
