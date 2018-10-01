import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { Constants } from 'botframework-webchat-core';
import connectWithContext from '../connectWithContext';
import IconButton from './IconButton';
import Localize from '../Localization/Localize';
import MicrophoneIcon from './Assets/MicrophoneIcon';

const { DictateState } = Constants;

const ROOT_CSS = css({
  display: 'flex',

  '& > .dictation': {
    alignItems: 'center',
    display: 'flex',
    flex: 1
  }
});

class MicrophoneButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { props } = this;

    if (props.dictateState === DictateState.STARTING || props.dictateState === DictateState.DICTATING) {
      props.stopSpeechInput();
    } else {
      props.startSpeechInput();
    }

    props.onClick && props.onClick();
  }

  render() {
    const {
      props: { className, dictateInterims, dictateState, disabled, styleSet }
    } = this;

    // TODO: [P3] After speech started, when clicking on the transcript, it should
    //       stop the dictation and allow the user to type-correct the transcript

    return (
      <div className={ classNames(
        styleSet.microphoneButton + '',
        ROOT_CSS + '',
        (className || '') + '',
        { dictating: dictateState === DictateState.DICTATING }
      ) }>
        { (dictateState === DictateState.STARTING || dictateState === DictateState.DICTATING) && (
            dictateInterims.length ?
              <p className="dictation interims">
                { dictateInterims.map((interim, index) => <span key={ index }>{ interim }</span>) }
              </p>
            :
              <p className="dictation status"><Localize text="Listening&hellip;" /></p>
        ) }
        <IconButton
          disabled={ disabled || (dictateState === DictateState.STARTING || dictateState === DictateState.STOPPING) }
          onClick={ this.handleClick }
        >
          <MicrophoneIcon />
        </IconButton>
      </div>
    );
  }
}

export default connectWithContext(
  ({ input: {
    dictateInterims,
    dictateState
  } }) => ({
    dictateInterims,
    dictateState
  }),
  ({
    disabled,
    startSpeechInput,
    stopSpeechInput,
    styleSet
  }) => ({
    disabled,
    startSpeechInput,
    stopSpeechInput,
    styleSet
  })
)(MicrophoneButton)
