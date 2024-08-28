import { WaitUntilable } from './internal/createWaitUntilable';
import { createPropagation } from 'use-propagate';

export type SendBoxFocusOptions = WaitUntilable<{ noKeyboard: boolean }>;

const {
  PropagationScope: FocusSendBoxScope,
  useListen: useRegisterFocusSendBox,
  usePropagate: useFocusSendBox
} = createPropagation<SendBoxFocusOptions>();

export { FocusSendBoxScope, useRegisterFocusSendBox, useFocusSendBox };
