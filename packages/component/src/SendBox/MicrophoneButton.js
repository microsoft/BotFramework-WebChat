import { Composer as DictateComposer } from 'react-dictate-button';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { withStyleSet } from '../Context';

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

  handleClick() {
    this.setState(({ readyState }) => ({
      readyState: readyState === DICTATING ? STOPPING : STARTING
    }));

    this.props.onClick && this.props.onClick();
  }

  handleDictate({ result: { transcript } = {} }) {
    this.setState(() => ({
      readyState: IDLE
    }));

    this.props.onDictate && this.props.onDictate({ transcript });
  }

  handleDictating({ results = [] }) {
    const interims = results.map(({ transcript }) => transcript);

    this.setState(() => ({
      readyState: DICTATING
    }));

    this.props.onDictating && this.props.onDictating({ interims });
  }

  handleError(event) {
    this.setState(() => ({
      readyState: IDLE
    }));

    this.props.onError && this.props.onError(event);
  }

  render() {
    const {
      props: { disabled, styleSet },
      state: { readyState }
    } = this;

    return (
      <DictateComposer
        onDictate={ this.handleDictate }
        onError={ this.handleError }
        onProgress={ this.handleDictating }
        speechRecognition={ window.SpeechRecognition || window.webkitSpeechRecognition }
        speechGrammarList={ window.SpeechGrammarList || window.webkitSpeechGrammarList }
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

export default withStyleSet(MicrophoneButton)
