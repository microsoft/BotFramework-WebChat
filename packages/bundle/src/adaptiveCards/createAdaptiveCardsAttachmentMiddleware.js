import PropTypes from 'prop-types';
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
  return () => next => {
    function AdaptiveCardMiddleware({ activity, attachment }) {
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
        next({ activity, attachment })
      );
    }

    AdaptiveCardMiddleware.propTypes = {
      activity: PropTypes.any.isRequired,
      attachment: PropTypes.shape({
        contentType: PropTypes.string.isRequired
      }).isRequired
    };

    return AdaptiveCardMiddleware;
  };
}
