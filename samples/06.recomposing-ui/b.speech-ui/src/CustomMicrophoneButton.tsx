import { Constants, hooks } from 'botframework-webchat';
import classNames from 'classnames';
import React, { memo } from 'react';

import MicrophoneIcon from './MicrophoneIcon';

const { useStartDictate, useDictateState, useDisabled } = hooks;

const {
  DictateState: { DICTATING }
} = Constants;

function CustomMicrophoneButton({ className }: Readonly<{ className?: string | undefined }>) {
  const [disabled] = useDisabled();
  const [dictateState] = useDictateState();
  const startDictate = useStartDictate();
  const dictating = dictateState === DICTATING;

  return (
    <button className={classNames(className, { dictating })} disabled={disabled} onClick={startDictate} type="button">
      <MicrophoneIcon size="10vmin" />
    </button>
  );
}

export default memo(CustomMicrophoneButton);
