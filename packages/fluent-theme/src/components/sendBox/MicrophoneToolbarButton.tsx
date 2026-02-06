import { hooks } from 'botframework-webchat';
import { useVoiceStateWritable } from 'botframework-webchat/internal';
import cx from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';

import { useStyles } from '../../styles';
import testIds from '../../testIds';
import { FluentIcon } from '../icon';
import { ToolbarButton } from './Toolbar';

import styles from './Toolbar.module.css';

const { useLocalizer, useStartVoice } = hooks;

function MicrophoneToolbarButton() {
  const [voiceState, setVoiceState] = useVoiceStateWritable();
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const startVoice = useStartVoice();

  const recording = voiceState !== 'idle';

  const icon = useMemo(() => {
    switch (voiceState) {
      case 'muted':
        return 'microphone-mute';
      case 'bot_speaking':
        return 'audio-playing';
      case 'idle':
        return 'microphone-idle';
      default:
        return 'microphone-active';
    }
  }, [voiceState]);

  const handleMicrophoneClick = useCallback(() => {
    if (voiceState === 'idle') {
      startVoice(); // If it was stopped, will start recognition. It will synthesize when the bot respond.
    } else if (voiceState === 'listening') {
      setVoiceState('muted'); // listening <-> muted (VoiceRecorderBridge handles silent chunks)
    } else if (voiceState === 'muted') {
      setVoiceState('listening'); // listening <-> muted
    }
    // Other states (user_speaking, processing, bot_speaking) are non-interactive
  }, [startVoice, setVoiceState, voiceState]);

  const ariaLabel = localize(
    recording ? 'SPEECH_INPUT_MICROPHONE_BUTTON_OPEN_ALT' : 'SPEECH_INPUT_MICROPHONE_BUTTON_CLOSE_ALT'
  );

  const isBotSpeaking = voiceState === 'bot_speaking';
  const isUserSpeaking = voiceState === 'user_speaking';

  return (
    <ToolbarButton
      aria-label={ariaLabel}
      className={cx({
        [classNames['sendbox__toolbar-button--active']]: recording,
        [classNames['sendbox__toolbar-button--with-pulse']]: isBotSpeaking || isUserSpeaking,
        [classNames['sendbox__toolbar-button--with-gradient']]: isUserSpeaking
      })}
      data-testid={testIds.sendBoxMicrophoneButton}
      onClick={handleMicrophoneClick}
      type="button"
    >
      <FluentIcon appearance="text" icon={icon} />
    </ToolbarButton>
  );
}

MicrophoneToolbarButton.displayName = 'SendBox.MicrophoneToolbarButton';

export default memo(MicrophoneToolbarButton);
