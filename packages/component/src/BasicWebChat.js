import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import BasicSendBox from './SendBox/BasicSendBox';
import BasicTranscript from './Transcript/BasicTranscript';
import Composer from './Composer';
import TypeFocusSinkBox from './Utils/TypeFocusSink';

import createMiddlewareStack from './Middleware/createMiddlewareStack';
import createCoreAttachmentMiddleware from './Middleware/Attachment/core';
import createAdaptiveCardsAttachmentMiddleware from './Middleware/Attachment/adaptiveCard';

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

    this.attachmentRenderer = createMiddlewareStack(
      {},
      [
        createCoreAttachmentMiddleware,
        createAdaptiveCardsAttachmentMiddleware
      ]
    );
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
              { ({ activity, attachment }) =>
                this.attachmentRenderer.run({ attachment, activity })
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
