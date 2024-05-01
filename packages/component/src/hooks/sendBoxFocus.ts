import { type WaitUntilable } from './internal/createWaitUntilable';
import { createPropagation } from 'use-propagate';

export type SendBoxFocusOptions = WaitUntilable<{ noKeyboard: boolean }>;

const { useListen: useRegisterFocusSendBox, usePropagate: useFocusSendBox } = createPropagation<SendBoxFocusOptions>();

export { useRegisterFocusSendBox, useFocusSendBox };
