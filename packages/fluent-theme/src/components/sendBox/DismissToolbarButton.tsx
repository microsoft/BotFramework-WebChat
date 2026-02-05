import { hooks } from 'botframework-webchat';
import React, { memo, useCallback } from 'react';

import testIds from '../../testIds';
import { FluentIcon } from '../icon';
import { ToolbarButton } from './Toolbar';

const { useStopVoice, useLocalizer } = hooks;

/**
 * Dismiss button that stops the voice session and returns to idle state.
 * This is needed to stop recording as mic button is used to start/mute and cannot be used to stop recording.
 */
function DismissToolbarButton() {
  const localize = useLocalizer();
  const stopVoice = useStopVoice();
  
  const ariaLabel = localize('SPEECH_INPUT_STOP_RECORDING_ALT');

  const handleDismissClick = useCallback(() => {
    stopVoice();
  }, [stopVoice]);

  return (
    <ToolbarButton
      aria-label={ariaLabel}
      data-testid={testIds.sendBoxDismissButton}
      onClick={handleDismissClick}
      type="button"
    >
      <FluentIcon appearance="text" icon="dismiss" />
    </ToolbarButton>
  );
}

DismissToolbarButton.displayName = 'SendBox.DismissToolbarButton';

export default memo(DismissToolbarButton);
