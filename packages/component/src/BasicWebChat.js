import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import BasicSendBox from './SendBox/BasicSendBox';
import BasicTranscript from './Transcript/BasicTranscript';
import Composer from './Composer';
import TypeFocusSinkBox from './Utils/TypeFocusSink';

import AdaptiveCardAttachment from './Attachment/AdaptiveCardAttachment';
import AnimationCardAttachment from './Attachment/AnimationCardAttachment';
import AudioAttachment from './Attachment/AudioAttachment';
import AudioCardAttachment from './Attachment/AudioCardAttachment';
import DownloadAttachment from './Attachment/DownloadAttachment';
import HeroCardAttachment from './Attachment/HeroCardAttachment';
import ImageAttachment from './Attachment/ImageAttachment';
import OAuthCardAttachment from './Attachment/OAuthCardAttachment';
import ReceiptCardAttachment from './Attachment/ReceiptCardAttachment';
import SignInCardAttachment from './Attachment/SignInCardAttachment';
import TextAttachment from './Attachment/TextAttachment';
import ThumbnailCardAttachment from './Attachment/ThumbnailCardAttachment';
import VideoAttachment from './Attachment/VideoAttachment';
import VideoCardAttachment from './Attachment/VideoCardAttachment';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column'
});

const TRANSCRIPT_CSS = css({
  flex: 1,
  overflowY: 'auto'
});

const SEND_BOX_CSS = css({
  flexShrink: 0
});

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.sendBoxRef = React.createRef();
  }

  render() {
    const { props } = this;

    // TODO: Implement "scrollToBottom" feature

    return (
      <Composer
        sendBoxRef={ this.sendBoxRef }
        { ...props }
      >
        { ({ styleSet }) =>
          <TypeFocusSinkBox
            className={ classNames(ROOT_CSS + '', styleSet.root + '', (props.className || '') + '') }
            sendFocusRef={ this.sendBoxRef }
          >
            <BasicTranscript className={ TRANSCRIPT_CSS + '' }>
              { ({ activity, attachment }) => attachment.contentType === 'application/vnd.microsoft.card.hero' ?
                  <HeroCardAttachment activity={ activity } attachment={ attachment } />
                : attachment.contentType === 'application/vnd.microsoft.card.adaptive' ?
                  <AdaptiveCardAttachment activity={ activity } attachment={ attachment } />
                : attachment.contentType === 'application/vnd.microsoft.card.animation' ?
                  <AnimationCardAttachment activity={ activity } attachment={ attachment } />
                : attachment.contentType === 'application/vnd.microsoft.card.audio' ?
                  <AudioCardAttachment activity={ activity } attachment={ attachment } />
                : attachment.contentType === 'application/vnd.microsoft.card.oauth' ?
                  <OAuthCardAttachment activity={ activity } attachment={ attachment } />
                : attachment.contentType === 'application/vnd.microsoft.card.postback' ?
                  false
                : attachment.contentType === 'application/vnd.microsoft.card.receipt' ?
                  <ReceiptCardAttachment activity={ activity } attachment={ attachment } />
                : attachment.contentType === 'application/vnd.microsoft.card.signin' ?
                  <SignInCardAttachment activity={ activity } attachment={ attachment } />
                : attachment.contentType === 'application/vnd.microsoft.card.thumbnail' ?
                  <ThumbnailCardAttachment activity={ activity } attachment={ attachment } />
                : attachment.contentType === 'application/vnd.microsoft.card.video' ?
                  <VideoCardAttachment activity={ activity } attachment={ attachment } />
                : /^audio\//.test(attachment.contentType) ?
                  <AudioAttachment activity={ activity } attachment={ attachment } />
                : /^image\//.test(attachment.contentType) ?
                  <ImageAttachment activity={ activity } attachment={ attachment } />
                : /^text\//.test(attachment.contentType) ?
                  <TextAttachment activity={ activity } attachment={ attachment } />
                : /^video\//.test(attachment.contentType) ?
                  <VideoAttachment activity={ activity } attachment={ attachment } />
                : attachment.contentType === 'application/octet-stream' ?
                  <DownloadAttachment activity={ activity } attachment={ attachment } />
                :
                  undefined
              }
            </BasicTranscript>
            <BasicSendBox
              className={ SEND_BOX_CSS }
            />
          </TypeFocusSinkBox>
        }
      </Composer>
    );
  }
}
