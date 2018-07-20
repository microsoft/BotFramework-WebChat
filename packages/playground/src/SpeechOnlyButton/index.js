import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';
import DictateButton from 'react-dictate-button';

import MicrophoneIcon from './Assets/MicrophoneIcon';

const ROOT_CSS = css({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  justifyContent: 'center',

  '& > p': {
    fontSize: '200%'
  },

  '& > .final': {
  },

  '& > .interim': {
    '& > span:last-child': {
      opacity: .5
    }
  },

  '& .dictate-button': {
    background: '#EEE',
    border: 0,
    borderRadius: '50%',
    cursor: 'pointer',
    outline: 0,
    padding: 20,

    '& .microphone-icon': {
      height: 80,
      width: 80
    },

    '&:hover': {
      background: '#666',

      '& .microphone-icon': {
        fill: 'White'
      }
    }
  },

  '&.dictating .dictate-button': {
    background: 'Red',

    '& .microphone-icon': {
      fill: 'White'
    }
  }
});

export default class SpeechOnlyButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleDictate = this.handleDictate.bind(this);
    this.handleProgress = this.handleProgress.bind(this);

    this.state = {
      dictating: false,
      final: '',
      interims: []
    };
  }

  handleDictate({ result: { transcript: final = '' } = {} }) {
    this.setState(() => ({
      dictating: false,
      final
    }));
  }

  handleProgress({ results = [] }) {
    this.setState(() => ({
      dictating: true,
      interims: results.map(({ transcript }) => transcript)
    }));
  }

  render() {
    const { state } = this;

    return (
      <div className={ classNames(ROOT_CSS + '', { dictating: state.dictating }) }>
        <DictateButton
          className="dictate-button"
          onDictate={ this.handleDictate.bind(this) }
          onProgress={ this.handleProgress.bind(this) }
        >
          <MicrophoneIcon className="microphone-icon" />
        </DictateButton>
        {
          state.dictating ?
            <p className="interims">
              { state.interims.map(interim => <span>{ interim }</span>) }
            </p>
          :
            <p className="final">
              { state.final }
            </p>
        }
      </div>
    );
  }
}
