import React from 'react';

import AdaptiveCardAttachment from './Attachment/AdaptiveCardAttachment';
import AnimationCardAttachment from './Attachment/AnimationCardAttachment';
import AudioCardAttachment from './Attachment/AudioCardAttachment';
import HeroCardAttachment from './Attachment/HeroCardAttachment';
import OAuthCardAttachment from './Attachment/OAuthCardAttachment';
import ReceiptCardAttachment from './Attachment/ReceiptCardAttachment';
import SignInCardAttachment from './Attachment/SignInCardAttachment';
import ThumbnailCardAttachment from './Attachment/ThumbnailCardAttachment';
import VideoCardAttachment from './Attachment/VideoCardAttachment';

export default function createAdaptiveCardsAttachmentMiddleware() {
  // This is not returning a React component, but a render function.
  /* eslint-disable-next-line react/display-name */
  return () => next => (...args) => {
    const [{ activity, attachment }] = args;

    return attachment.contentType === 'application/vnd.microsoft.card.hero' ? (
      <HeroCardAttachment activity={activity} attachment={attachment} />
    ) : attachment.contentType === 'application/vnd.microsoft.card.adaptive' ? (
      <AdaptiveCardAttachment activity={activity} attachment={attachment} />
    ) : attachment.contentType === 'application/vnd.microsoft.card.animation' ? (
      <AnimationCardAttachment activity={activity} attachment={attachment} />
    ) : attachment.contentType === 'application/vnd.microsoft.card.audio' ? (
      <AudioCardAttachment activity={activity} attachment={attachment} />
    ) : attachment.contentType === 'application/vnd.microsoft.card.oauth' ? (
      <OAuthCardAttachment activity={activity} attachment={attachment} />
    ) : attachment.contentType === 'application/vnd.microsoft.card.receipt' ? (
      <ReceiptCardAttachment activity={activity} attachment={attachment} />
    ) : attachment.contentType === 'application/vnd.microsoft.card.signin' ? (
      <SignInCardAttachment activity={activity} attachment={attachment} />
    ) : attachment.contentType === 'application/vnd.microsoft.card.thumbnail' ? (
      <ThumbnailCardAttachment activity={activity} attachment={attachment} />
    ) : attachment.contentType === 'application/vnd.microsoft.card.video' ? (
      <VideoCardAttachment activity={activity} attachment={attachment} />
    ) : (
      next(...args)
    );
  };
}
