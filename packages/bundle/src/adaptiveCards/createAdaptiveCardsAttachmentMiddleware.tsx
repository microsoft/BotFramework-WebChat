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
      const [{ attachment }] = args;

      return attachment.contentType === 'application/vnd.microsoft.card.hero' ? (
        <HeroCardAttachment attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.adaptive' ? (
        <AdaptiveCardAttachment attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.animation' ? (
        <AnimationCardAttachment attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.audio' ? (
        <AudioCardAttachment attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.oauth' ? (
        <OAuthCardAttachment attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.receipt' ? (
        <ReceiptCardAttachment attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.signin' ? (
        <SignInCardAttachment attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.thumbnail' ? (
        <ThumbnailCardAttachment attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.video' ? (
        <VideoCardAttachment attachment={attachment} />
      ) : (
        next(...args)
      );
    };
}
