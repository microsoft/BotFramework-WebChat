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
      const [{ activity, attachment }] = args;

      return attachment.contentType === 'application/vnd.microsoft.card.hero' ? (
        <HeroCardAttachment
          // Not sure why we need to force-cast `contentType` even we already have a ternary operator above.
          attachment={attachment as typeof attachment & { contentType: 'application/vnd.microsoft.card.hero' }}
          replyToId={activity?.id}
        />
      ) : attachment.contentType === 'application/vnd.microsoft.card.adaptive' ? (
        <AdaptiveCardAttachment attachment={attachment} replyToId={activity?.id} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.animation' ? (
        <AnimationCardAttachment
          // TODO: [P1] Fix the typing of "attachment" request, it should allow "DirectLineMediaCard".
          attachment={attachment as typeof attachment & { contentType: 'application/vnd.microsoft.card.animation' }}
          replyToId={activity?.id}
        />
      ) : attachment.contentType === 'application/vnd.microsoft.card.audio' ? (
        <AudioCardAttachment
          attachment={attachment as typeof attachment & { contentType: 'application/vnd.microsoft.card.audio' }}
          replyToId={activity?.id}
        />
      ) : attachment.contentType === 'application/vnd.microsoft.card.oauth' ? (
        <OAuthCardAttachment
          attachment={attachment as typeof attachment & { contentType: 'application/vnd.microsoft.card.oauth' }}
          replyToId={activity?.id}
        />
      ) : attachment.contentType === 'application/vnd.microsoft.card.receipt' ? (
        <ReceiptCardAttachment
          attachment={attachment as typeof attachment & { contentType: 'application/vnd.microsoft.card.receipt' }}
          replyToId={activity?.id}
        />
      ) : attachment.contentType === 'application/vnd.microsoft.card.signin' ? (
        <SignInCardAttachment
          attachment={attachment as typeof attachment & { contentType: 'application/vnd.microsoft.card.signin' }}
          replyToId={activity?.id}
        />
      ) : attachment.contentType === 'application/vnd.microsoft.card.thumbnail' ? (
        <ThumbnailCardAttachment
          attachment={attachment as typeof attachment & { contentType: 'application/vnd.microsoft.card.thumbnail' }}
          replyToId={activity?.id}
        />
      ) : attachment.contentType === 'application/vnd.microsoft.card.video' ? (
        <VideoCardAttachment
          attachment={attachment as typeof attachment & { contentType: 'application/vnd.microsoft.card.video' }}
          replyToId={activity?.id}
        />
      ) : (
        next(...args)
      );
    };
}
