import { Composer as SayComposer } from 'react-say';
import { connect } from 'react-redux';
import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

import BasicActivity from '../Activity2/Activity';
import Context from '../Context';
import SpeakActivity from '../Activity2/Speak';
import UnknownAttachment from '../Attachment/UnknownAttachment';

const ROOT_CSS = css({
  display: 'flex',
  flexDirection: 'column',
  WebkitOverflowScrolling: 'touch'
});

const FILLER_CSS = css({
  flex: 1
});

const LIST_CSS = css({
  listStyleType: 'none'
});

// TODO: Collapse timestamps if they are less than 5 minutes apart

const BasicTranscript = ({
  activities,
  className,
  children,
  styleSet,
  webSpeechPonyfill: { speechSynthesis, SpeechSynthesisUtterance } = {}
}) =>
  <ScrollToBottom
    className={ className }
    threshold={ styleSet.options.scrollToBottomThreshold }
    scrollViewClassName={ ROOT_CSS + '' }
  >
    <div className={ FILLER_CSS } />
    <SayComposer
      speechSynthesis={ speechSynthesis }
      speechSynthesisUtterance={ SpeechSynthesisUtterance }
    >
      <ul className={ classNames(LIST_CSS + '', styleSet.activities + '') }>
        {
          activities.map((activity, index) =>
            <li
              className={ styleSet.activity }
              key={ index }
            >
              <BasicActivity activity={ activity }>
                {
                  card => {
                    try {
                      return children && children(card);
                    } catch (err) {
                      return (
                        // TODO: Consider making the UnknownAttachment as part of the middleware
                        <UnknownAttachment message="Failed to render card">
                          <pre>{ JSON.stringify(card, null, 2) }</pre>
                          <br />
                          <pre>{ err.stack }</pre>
                        </UnknownAttachment>
                      );
                    }
                  }
                }
              </BasicActivity>
              {
                activity.channelData && activity.channelData.speak && <SpeakActivity activity={ activity } />
              }
            </li>
          )
        }
      </ul>
    </SayComposer>
  </ScrollToBottom>

export default connect(({ activities }) => ({ activities }))(({ children, ...props }) =>
  <Context.Consumer>
    { ({
      styleSet,
      webSpeechPonyfill
    }) =>
      <BasicTranscript
        styleSet={ styleSet }
        webSpeechPonyfill={ webSpeechPonyfill }
        { ...props }
      >
        { children }
      </BasicTranscript>
    }
  </Context.Consumer>
)
