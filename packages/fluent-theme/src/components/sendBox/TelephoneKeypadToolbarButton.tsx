import React, { memo, useCallback } from 'react';

import { hooks } from 'botframework-webchat-component';
import { FluentIcon } from '../icon';
import testIds from '../../testIds';
import { useTelephoneKeypadShown } from '../telephoneKeypad';
import { ToolbarButton } from './Toolbar';

const { useLocalizer } = hooks;

const TelephoneKeypadToolbarButton = memo(() => {
  const [telephoneKeypadShown, setTelephoneKeypadShown] = useTelephoneKeypadShown();
  const localize = useLocalizer();

  const handleClick = useCallback(() => setTelephoneKeypadShown(shown => !shown), [setTelephoneKeypadShown]);

  return (
    <ToolbarButton
      aria-label={localize('TEXT_INPUT_TELEPHONE_KEYPAD_BUTTON_ALT')}
      data-testid={testIds.sendBoxTelephoneKeypadToolbarButton}
      onClick={handleClick}
      selected={telephoneKeypadShown}
    >
      <FluentIcon appearance="text" icon="keypad" />
    </ToolbarButton>
  );
});

TelephoneKeypadToolbarButton.displayName = 'SendBox.TelephoneKeypadToolbarButton';

export default TelephoneKeypadToolbarButton;
