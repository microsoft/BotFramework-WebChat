import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';

import { useStyles } from '../../styles';
import testIds from '../../testIds';
import { FluentIcon } from '../icon';
import { ToolbarButton } from './Toolbar';

import styles from './Toolbar.module.css';

const { useSpeechToSpeech, useLocalizer } = hooks;

function MicrophoneToolbarButton() {
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const [{ recording, setRecording, speechState }] = useSpeechToSpeech();

  const handleClick = useCallback(() => {
    setRecording(!recording);
  }, [recording, setRecording]);

  const icon = useMemo(() => {
    switch (speechState) {
      case 'listening':
      case 'processing':
        return 'microphone';

      case 'bot_speaking':
        return 'audio-playing';

      default:
        return 'microphone';
    }
  }, [speechState]);

  const ariaLabel = localize(
    recording ? 'SPEECH_INPUT_MICROPHONE_BUTTON_OPEN_ALT' : 'SPEECH_INPUT_MICROPHONE_BUTTON_CLOSE_ALT'
  );

  const isBotSpeaking = speechState === 'bot_speaking';
  const isUserSpeaking = speechState === 'user_speaking';

  return (
    <ToolbarButton
      aria-label={ariaLabel}
      className={cx({
        [classNames['sendbox__toolbar-button--active']]: speechState !== 'idle',
        [classNames['sendbox__toolbar-button--with-pulse']]: isBotSpeaking || isUserSpeaking,
        [classNames['sendbox__toolbar-button--with-gradient']]: isUserSpeaking
      })}
      data-testid={testIds.sendBoxMicrophoneButton}
      onClick={handleClick}
      type="button"
    >
      <FluentIcon appearance="text" icon={icon} />
    </ToolbarButton>
  );
}

MicrophoneToolbarButton.displayName = 'SendBox.MicrophoneToolbarButton';

export default memo(MicrophoneToolbarButton);
