import React, { memo } from 'react';

import type { PropsOf } from '../../types/PropsOf';
import TelephoneKeypad from './private/TelephoneKeypad';
import useShown from './useShown';

type Props = PropsOf<typeof TelephoneKeypad>;

const TelephoneKeypadSurrogate = memo((props: Props) => (useShown()[0] ? <TelephoneKeypad {...props} /> : false));

TelephoneKeypadSurrogate.displayName = 'TelephoneKeypad.Surrogate';

export default TelephoneKeypadSurrogate;
