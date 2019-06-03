import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { connectToWebChat } from 'botframework-webchat';

const ROOT_CSS = css({
  alignItems: 'flex-start',
  display: 'flex',
  position: 'relative',

  '& > .content': {
    flex: 1,
    overflow: 'hidden',
    width: '100%'
  },

  '&.from-user > button': {
    right: 0
  },

  '&:not(.from-user) > button': {
    left: 0
  },

  '& > button': {
    backgroundColor: 'transparent',
    border: 0,
    margin: 0,
    outline: 0,
    padding: 0,
    position: 'absolute',
    top: 0,

    '&:hover > svg': {
      fill: '#767676'
    }
  }
});

class SpeakActivity extends React.Component {
  constructor(props) {
    super(props);

    this.handleSpeak = this.handleSpeak.bind(this);
  }

  handleSpeak() {
    this.props.markActivity(this.props.activity, 'speak', true);
  }

  render() {
    const {
      props: { activity, children },
      handleSpeak
    } = this;

    return (
      <div className={classNames(ROOT_CSS + '', { 'from-user': activity.from.role === 'user' })}>
        <div className="content">{children}</div>
        <button onClick={handleSpeak} tabIndex={-1}>
          <svg fill="#CCC" height="11" viewBox="0 0 58 58" width="14">
            <path d="M 44 28 C 43.448 28 43 28.447 43 29 L 43 35 C 43 42.72 36.72 49 29 49 C 21.28 49 15 42.72 15 35 L 15 29 C 15 28.447 14.552 28 14 28 C 13.448 28 13 28.447 13 29 L 13 35 C 13 43.485 19.644 50.429 28 50.949 L 28 56 L 23 56 C 22.448 56 22 56.447 22 57 C 22 57.553 22.448 58 23 58 L 35 58 C 35.552 58 36 57.553 36 57 C 36 56.447 35.552 56 35 56 L 30 56 L 30 50.949 C 38.356 50.429 45 43.484 45 35 L 45 29 C 45 28.447 44.552 28 44 28 Z" />
            <path d="M 28.97 44.438 L 28.97 44.438 C 23.773 44.438 19.521 40.033 19.521 34.649 L 19.521 11.156 C 19.521 5.772 23.773 1.368 28.97 1.368 L 28.97 1.368 C 34.166 1.368 38.418 5.772 38.418 11.156 L 38.418 34.649 C 38.418 40.033 34.166 44.438 28.97 44.438 Z" />
            <path d="M 29 46 C 35.065 46 40 41.065 40 35 L 40 11 C 40 4.935 35.065 0 29 0 C 22.935 0 18 4.935 18 11 L 18 35 C 18 41.065 22.935 46 29 46 Z M 20 11 C 20 6.037 24.038 2 29 2 C 33.962 2 38 6.037 38 11 L 38 35 C 38 39.963 33.962 44 29 44 C 24.038 44 20 39.963 20 35 L 20 11 Z" />
          </svg>
        </button>
      </div>
    );
  }
}

const ConnectedDevModeDecorator = connectToWebChat(({ markActivity, webSpeechPonyfill }) => ({
  markActivity,
  webSpeechPonyfill
}))(({ card, children, markActivity, webSpeechPonyfill }) =>
  (webSpeechPonyfill || {}).speechSynthesis ? (
    <SpeakActivity activity={card.activity} markActivity={markActivity}>
      {children}
    </SpeakActivity>
  ) : (
    children
  )
);

export default function() {
  return () => next => card => {
    return children => {
      const content = next(card)(children);

      return !!content && <ConnectedDevModeDecorator card={card}>{content}</ConnectedDevModeDecorator>;
    };
  };
}
