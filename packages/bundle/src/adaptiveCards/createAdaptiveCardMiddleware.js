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

// TODO: [P4] Rename this file or the whole middleware, it looks either too simple or too comprehensive now
export default function createAdaptiveCardMiddleware(props) {
  return () => next => {
    function AdaptiveCardMiddleware({ activity, attachment }) {
      return attachment.contentType === 'application/vnd.microsoft.card.hero' ? (
        <HeroCardAttachment {...props} activity={activity} attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.adaptive' ? (
        <AdaptiveCardAttachment {...props} activity={activity} attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.animation' ? (
        <AnimationCardAttachment {...props} activity={activity} attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.audio' ? (
        <AudioCardAttachment {...props} activity={activity} attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.oauth' ? (
        <OAuthCardAttachment {...props} activity={activity} attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.receipt' ? (
        <ReceiptCardAttachment {...props} activity={activity} attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.signin' ? (
        <SignInCardAttachment {...props} activity={activity} attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.thumbnail' ? (
        <ThumbnailCardAttachment {...props} activity={activity} attachment={attachment} />
      ) : attachment.contentType === 'application/vnd.microsoft.card.video' ? (
        <VideoCardAttachment {...props} activity={activity} attachment={attachment} />
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
