export type ContextType = {
  submit: (options?: { setFocus?: 'main' | 'sendBox' | 'sendBoxWithoutKeyboard' }) => void;
  submitErrorMessageIdState: readonly [string];
};

export type SendError = 'empty' | 'offline';
