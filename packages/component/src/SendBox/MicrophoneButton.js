import { Composer as DictateComposer } from 'react-dictate-button';
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Context from '../Context';
import IconButton from './IconButton';
import MicrophoneIcon from './Assets/MicrophoneIcon';

const IDLE = 0;
const STARTING = 1;
const DICTATING = 2;
const STOPPING = 3;

class MicrophoneButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleDictate = this.handleDictate.bind(this);
    this.handleDictating = this.handleDictating.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleMicrophoneClick = this.handleClick.bind(this);

    this.state = {
      readyState: IDLE,
      interims: []
    };
  }

  componentWillReceiveProps({ speechState: nextSpeechState }) {
    const { speechState } = this.props;

    if (!speechState && nextSpeechState) {
      // Turned on speech
      this.setState(({ readyState }) => {
        if (readyState !== STARTING && readyState !== DICTATING) {
          return { readyState: STARTING };
        }
      });
    } else if (speechState && !nextSpeechState) {
      // Turned off speech
      this.setState(({ readyState }) => {
        if (readyState === STARTING || readyState === DICTATING) {
          return { readyState: STOPPING };
        }
      });
    }
  }

  handleClick() {
    const { props } = this;

    if (props.speechState) {
      props.stopSpeechInput();
    } else {
      props.startSpeechInput();
    }

    props.onClick && props.onClick();
  }

  handleDictate({ result: { transcript } = {} }) {
    const { props } = this;

    this.setState(() => ({
      readyState: IDLE
    }));

    props.stopSpeechInput();
    props.sendTyping(false);

    if (transcript) {
      props.sendMessage(transcript);
      props.startSpeakingActivity();
    }
  }

  handleDictating({ results = [] }) {
    const { props } = this;
    const interims = results.map(({ transcript }) => transcript);

    this.setState(() => ({
      readyState: DICTATING
    }));

    props.sendTyping();
    props.onDictating && props.onDictating({ interims });
  }

  handleError(event) {
    const { props } = this;

    this.setState(() => ({
      readyState: IDLE
    }));

    props.stopSpeechInput();
    props.sendTyping(false);
    props.onError && props.onError(event);
  }

  render() {
    const {
      props: { disabled },
      state: { readyState }
    } = this;

    return (
      <Context.Consumer>
        { ({ styleSet, webSpeechPolyfill }) =>
          <DictateComposer
            extra={ webSpeechPolyfill.extra }
            onDictate={ this.handleDictate }
            onError={ this.handleError }
            onProgress={ this.handleDictating }
            speechRecognition={ webSpeechPolyfill.SpeechRecognition }
            speechGrammarList={ webSpeechPolyfill.SpeechGrammarList }
            started={ !disabled && (readyState === STARTING || readyState === DICTATING) }
          >
            { () =>
              <IconButton
                className={ classNames(
                  styleSet.microphoneButton + '',
                  { dictating: readyState === DICTATING }
                ) }
                disabled={ disabled && (readyState === STARTING || readyState === STOPPING) }
                onClick={ this.handleClick }
              >
                <MicrophoneIcon />
              </IconButton>
            }
          </DictateComposer>
        }
      </Context.Consumer>
    );
  }
}

MicrophoneButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  onDictating: PropTypes.func,
  onDictate: PropTypes.func,
  onError: PropTypes.func
};

export default connect(({ input: { speechState } }) => ({ speechState }))(props =>
  <Context.Consumer>
    { ({
        sendMessage,
        sendTyping,
        startSpeakingActivity,
        startSpeechInput,
        stopSpeechInput,
        styleSet
      }) =>
      <MicrophoneButton
        { ...props }
        sendMessage={ sendMessage }
        sendTyping={ sendTyping }
        startSpeakingActivity={ startSpeakingActivity }
        startSpeechInput={ startSpeechInput }
        stopSpeechInput={ stopSpeechInput }
        styleSet={ styleSet }
      />
    }
  </Context.Consumer>
)
