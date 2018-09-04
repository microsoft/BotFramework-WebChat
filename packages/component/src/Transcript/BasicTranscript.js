import { Composer as SayComposer } from 'react-say';
import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import SpeakActivity from '../Activity2/Speak';

import { withStyleSet } from '../Context';
// import BasicActivity from '../Activity/BasicActivity';
import BasicActivity from '../Activity2/Activity';
import Context from '../Context';
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

function last(array, predicate) {
  for (let index = array.length - 1; index >= 0; index--) {
    const value = array[index];

    if (predicate.call(array, value)) {
      return value;
    }
  }
}

export default withStyleSet(({ className, children, styleSet }) =>
  <ScrollToBottom
    className={ className }
    threshold={ styleSet.options.scrollToBottomThreshold }
    scrollViewClassName={ ROOT_CSS + '' }
  >
    <div className={ FILLER_CSS } />
    <Context.Consumer>
      { ({
        activities,
        lastSpokenTime,
        userID,
        webSpeechPolyfill: { speechSynthesis, SpeechSynthesisUtterance }
      }) =>
        <React.Fragment>
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
                            return children && children(card) || <UnknownAttachment message="No renderer for this card">{ JSON.stringify(card, null, 2) }</UnknownAttachment>;
                          } catch (err) {
                            return (
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
                      activity.from.id !== userID && activity.type === 'message' && new Date(activity.timestamp).getTime() > lastSpokenTime &&
                        <SpeakActivity activity={ activity } />
                    }
                  </li>
                )
              }
            </ul>
          </SayComposer>
        </React.Fragment>
      }
    </Context.Consumer>
  </ScrollToBottom>
)
