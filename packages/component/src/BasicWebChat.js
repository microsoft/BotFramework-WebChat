import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import BasicSendBox from './SendBox/BasicSendBox';
import BasicTranscript from './Transcript/BasicTranscript';
import Composer from './Composer';
import TypeFocusSinkBox from './Utils/TypeFocusSink';

import AdaptiveCardAttachment from './Attachment/AdaptiveCardAttachment';
import AudioAttachment from './Attachment/AudioAttachment';
import AudioCardAttachment from './Attachment/AudioCardAttachment';
import HeroCardAttachment from './Attachment/HeroCardAttachment';
import ImageAttachment from './Attachment/ImageAttachment';
import ReceiptCardAttachment from './Attachment/ReceiptCardAttachment';
import TextAttachment from './Attachment/TextAttachment';
import ThumbnailCardAttachment from './Attachment/ThumbnailCardAttachment';
import VideoAttachment from './Attachment/VideoAttachment';

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
        activities={ props.activities }
        focusSendBox={ this.sendBoxRef }
        renderMarkdown={ props.renderMarkdown }
        send={ props.send }
        styleSet={ props.styleSet }
        suggestedActions={ props.suggestedActions }
      >
        { ({ styleSet }) =>
          <TypeFocusSinkBox
            className={ classNames(ROOT_CSS + '', styleSet.root + '', (props.className || '') + '') }
            focusableRef={ this.sendBoxRef }
          >
            <BasicTranscript className={ TRANSCRIPT_CSS }>
              { attachment => attachment.contentType === 'application/vnd.microsoft.card.hero' ?
                  <HeroCardAttachment attachment={ attachment } />
                : attachment.contentType === 'application/vnd.microsoft.card.adaptive' ?
                  <AdaptiveCardAttachment attachment={ attachment } />
                : attachment.contentType === 'application/vnd.microsoft.card.audio' ?
                  <AudioCardAttachment attachment={ attachment } />
                : attachment.contentType === 'application/vnd.microsoft.card.receipt' ?
                  <ReceiptCardAttachment attachment={ attachment } />
                : attachment.contentType === 'application/vnd.microsoft.card.thumbnail' ?
                  <ThumbnailCardAttachment attachment={ attachment } />
                : /^audio\//.test(attachment.contentType) ?
                  <AudioAttachment attachment={ attachment } />
                : /^image\//.test(attachment.contentType) ?
                  <ImageAttachment attachment={ attachment } />
                : /^text\//.test(attachment.contentType) ?
                  <TextAttachment attachment={ attachment } />
                : /^video\//.test(attachment.contentType) &&
                  <VideoAttachment attachment={ attachment } />
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
