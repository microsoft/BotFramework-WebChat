import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import BasicSendBox from './SendBox/BasicSendBox';
import BasicTranscript from './Transcript/BasicTranscript';
import Composer from './Composer';
import TypeFocusSinkBox from './Utils/TypeFocusSink';

import HeroCard from './Attachment/HeroCard';
import TextCard from './Attachment/TextCard';

const ROOT_CSS = css({
  backgroundColor: '#EEE',
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

    this.rootRef = React.createRef();
  }

  render() {
    const { props } = this;

    // TODO: Implement "scrollToBottom" feature

    return (
      <TypeFocusSinkBox className={ classNames(ROOT_CSS + '', (props.className || '') + '') }>
        { ({ focus }) =>
          <Composer
            activities={ props.activities }
            focusSendBox={ focus }
            renderMarkdown={ props.renderMarkdown }
            send={ props.send }
            styleSet={ props.styleSet }
            suggestedActions={ props.suggestedActions }
          >
            <BasicTranscript className={ TRANSCRIPT_CSS }>
              { attachment => attachment.contentType === 'application/vnd.microsoft.card.hero' ?
                  <HeroCard attachment={ attachment } />
                : /^text\//.test(attachment.contentType) &&
                  <TextCard
                    attachment={ attachment }
                    contentType={ attachment.contentType }
                  />
              }
            </BasicTranscript>
            <BasicSendBox
              className={ SEND_BOX_CSS }
            />
          </Composer>
        }
      </TypeFocusSinkBox>
    );
  }
}
