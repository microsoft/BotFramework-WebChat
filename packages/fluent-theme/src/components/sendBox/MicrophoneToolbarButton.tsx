import { hooks } from 'botframework-webchat';
import cx from 'classnames';
import React, { memo, useCallback } from 'react';

import { useStyles } from '../../styles';
import testIds from '../../testIds';
import { FluentIcon } from '../icon';
import { ToolbarButton } from './Toolbar';

import styles from './Toolbar.module.css';

const { useVoiceState, useStartVoice, useStopVoice, useLocalizer } = hooks;

function MicrophoneToolbarButton() {
  const [voiceState] = useVoiceState();
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const startVoice = useStartVoice();
  const stopVoice = useStopVoice();

  const recording = voiceState !== 'idle';

  const handleMicrophoneClick = useCallback(() => {
    if (recording) {
      stopVoice(); // Stop recognition and synthesis.
    } else {
      startVoice(); // If it was stopped, will start recognition. It will synthesize when the bot respond.
    }
  }, [recording, startVoice, stopVoice]);

  const ariaLabel = localize(
    recording ? 'SPEECH_INPUT_MICROPHONE_BUTTON_OPEN_ALT' : 'SPEECH_INPUT_MICROPHONE_BUTTON_CLOSE_ALT'
  );

  const isBotSpeaking = voiceState === 'bot_speaking';
  const isUserSpeaking = voiceState === 'user_speaking';

  return (
    <ToolbarButton
      aria-label={ariaLabel}
      className={cx({
        [classNames['sendbox__toolbar-button--active']]: voiceState !== 'idle',
        [classNames['sendbox__toolbar-button--with-pulse']]: isBotSpeaking || isUserSpeaking,
        [classNames['sendbox__toolbar-button--with-gradient']]: isUserSpeaking
      })}
      data-testid={testIds.sendBoxMicrophoneButton}
      onClick={handleMicrophoneClick}
      type="button"
    >
      <FluentIcon appearance="text" icon={voiceState === 'bot_speaking' ? 'audio-playing' : 'microphone'} />
    </ToolbarButton>
  );
}

MicrophoneToolbarButton.displayName = 'SendBox.MicrophoneToolbarButton';

export default memo(MicrophoneToolbarButton);
